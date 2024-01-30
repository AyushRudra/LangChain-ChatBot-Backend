// server.js

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import chatRouter from "./Router/chatRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(chatRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
