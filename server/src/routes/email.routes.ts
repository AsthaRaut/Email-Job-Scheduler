import { Router } from "express";
import {
  getEmails,
  scheduleEmails,
} from "../controllers/email.controller.js";

const router = Router();

router.get("/", getEmails);
router.post("/schedule", scheduleEmails);

export default router;
