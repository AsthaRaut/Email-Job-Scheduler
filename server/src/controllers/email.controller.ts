
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { pool } from "../config/db.js";
import { emailQueue } from "../queues/email.queue.js";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function scheduleEmails(
    req: Request,
    res: Response
): Promise<void> {
    const {
        userId,
        senderId,
        subject,
        body,
        recipients,
        startAt,
        delayMs = 2000,
        hourlyLimit = 100,
    } = req.body;

    if (
        !userId ||
        !senderId ||
        !subject?.trim() ||
        !body?.trim() ||
        !Array.isArray(recipients) ||
        recipients.length === 0 ||
        !startAt
    ) {
        res.status(400).json({
            success: false,
            message: "Required email scheduling details are missing.",
        });
        return;
    }

    if (!UUID_REGEX.test(userId) || !UUID_REGEX.test(senderId)) {
        res.status(400).json({
            success: false,
            message: "Invalid user ID or sender ID.",
        });
        return;
    }

    if (recipients.length > 10000) {
        res.status(400).json({
            success: false,
            message: "Maximum 10,000 recipients are allowed per campaign.",
        });
        return;
    }

    const normalizedRecipients = recipients.map((email: unknown) =>
        typeof email === "string" ? email.trim().toLowerCase() : ""
    );

    if (normalizedRecipients.some((email: string) => !EMAIL_REGEX.test(email))) {
        res.status(400).json({
            success: false,
            message: "One or more recipient email addresses are invalid.",
        });
        return;
    }

    if (
        !Number.isInteger(delayMs) ||
        delayMs < 0 ||
        !Number.isInteger(hourlyLimit) ||
        hourlyLimit <= 0
    ) {
        res.status(400).json({
            success: false,
            message: "Invalid delay or hourly limit.",
        });
        return;
    }

    const scheduledStart = new Date(startAt);

    if (
        Number.isNaN(scheduledStart.getTime()) ||
        scheduledStart.getTime() <= Date.now()
    ) {
        res.status(400).json({
            success: false,
            message: "Start time must be in the future.",
        });
        return;
    }

    const dbClient = await pool.connect();

    // Campaign ID is initialized as a string to satisfy BullMQ types.
    let campaignId = "";
    let transactionCommitted = false;

    const createdEmailIds: string[] = [];

    try {
        await dbClient.query("BEGIN");

        const senderResult = await dbClient.query(
            `SELECT id
       FROM senders
       WHERE id = $1
         AND user_id = $2
         AND is_active = TRUE`,
            [senderId, userId]
        );

        if (senderResult.rows.length === 0) {
            await dbClient.query("ROLLBACK");

            res.status(404).json({
                success: false,
                message: "Active sender account not found for this user.",
            });
            return;
        }

        const campaignResult = await dbClient.query(
            `INSERT INTO campaigns (
        user_id,
        sender_id,
        subject,
        body,
        start_at,
        delay_ms,
        hourly_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
            [
                userId,
                senderId,
                subject.trim(),
                body.trim(),
                scheduledStart,
                delayMs,
                hourlyLimit,
            ]
        );

        campaignId = campaignResult.rows[0].id;

        const emailRecords = [];

        for (let index = 0; index < normalizedRecipients.length; index++) {
            const recipient = normalizedRecipients[index];

            const scheduledAt = new Date(
                scheduledStart.getTime() + index * delayMs
            );

            const emailResult = await dbClient.query(
                `INSERT INTO emails (
          campaign_id,
          user_id,
          sender_id,
          recipient,
          subject,
          body,
          scheduled_at,
          idempotency_key
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
                [
                    campaignId,
                    userId,
                    senderId,
                    recipient,
                    subject.trim(),
                    body.trim(),
                    scheduledAt,
                    randomUUID(),
                ]
            );

            const emailId = emailResult.rows[0].id;

            createdEmailIds.push(emailId);

            emailRecords.push({
                emailId,
                campaignId,
                userId,
                senderId,
                recipient,
                subject: subject.trim(),
                body: body.trim(),
                scheduledAt,
            });
        }

        await dbClient.query("COMMIT");
        transactionCommitted = true;

        try {
            await emailQueue.addBulk(
                emailRecords.map((email) => ({
                    name: "send-email",
                    data: {
                        emailId: email.emailId,
                        campaignId: email.campaignId,
                        userId: email.userId,
                        senderId: email.senderId,
                        hourlyLimit: Number(hourlyLimit),
                        delayMs: Number(delayMs),
                        recipient: email.recipient,
                        subject: email.subject,
                        body: email.body,
                    },
                    opts: {
                        jobId: email.emailId,
                        delay: Math.max(
                            0,
                            email.scheduledAt.getTime() - Date.now()
                        ),
                    },
                }))
            );
        } catch (queueError) {
            for (const emailId of createdEmailIds) {
                try {
                    const job = await emailQueue.getJob(emailId);
                    if (job) await job.remove();
                } catch (removeError) {
                    console.error("Queue cleanup failed:", removeError);
                }
            }

            await pool.query(
                "DELETE FROM campaigns WHERE id = $1",
                [campaignId]
            );

            throw queueError;
        }

        res.status(201).json({
            success: true,
            message: "Email campaign scheduled successfully.",
            data: {
                campaignId,
                totalEmails: emailRecords.length,
                startAt: scheduledStart,
                delayMs,
                hourlyLimit,
            },
        });
    } catch (error) {
        if (!transactionCommitted) {
            try {
                await dbClient.query("ROLLBACK");
            } catch {
                // Transaction may already be rolled back.
            }
        }

        console.error("Email scheduling error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to schedule email campaign.",
        });
    } finally {
        dbClient.release();
    }
}


export async function getEmails(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
            return;
        }

        if (!UUID_REGEX.test(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
            return;
        }

        const result = await pool.query(
            `SELECT
                id,
                campaign_id,
                recipient,
                subject,
                status,
                scheduled_at,
                sent_at,
                attempts,
                error,
                created_at
            FROM emails
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 100`,
            [userId]
        );

        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Fetch emails error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch emails.",
        });
    }
}