

import express from "express";
import { processMessage } from "../Controller/chatController.js";

const router = express.Router();

router.post("/chat", processMessage);

export default router;
