
export async function sendSlackNotification(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("Slack webhook is not configured. Skipping notification.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack returned status ${response.status}`);
    }

    console.log("Slack notification sent successfully.");
  } catch (error) {
    console.error("Slack notification failed:", error);
  }
}
