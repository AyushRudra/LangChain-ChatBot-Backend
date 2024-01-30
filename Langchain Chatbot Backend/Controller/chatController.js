

import ChatBot from "../model/chatModel.js";

const chatBot = new ChatBot();

async function processMessage(req, res) {

  const { message } = req.body;
  
  const response = await chatBot.sendMessage(message);
  res.json({ response });
}

export { processMessage };
