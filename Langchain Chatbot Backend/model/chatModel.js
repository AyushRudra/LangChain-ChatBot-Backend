
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { HumanMessage, AIMessage } from "langchain/schema";
import { OpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const history = new ChatMessageHistory();

class ChatBot {
  constructor() {
    this.memory = new BufferMemory({ chatHistory: history });
    this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.chain = new ConversationChain({ llm: this.model, memory: this.memory });
  }

  async getUserInput(query) {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }

 async sendMessage(userInput) {
    try {
      if (userInput.trim().toLowerCase() === "exit") return "Goodbye!";
      
      if (userInput.trim().toLowerCase() === "history") {

        const messages = await history.getMessages();
        const uniqueMessages = [...new Set(messages)];
        return  uniqueMessages.map(message =>(message.text));
      }

      const humanMessage = new HumanMessage(userInput);
      this.memory.chatHistory.addMessage(humanMessage);

      const response = await this.chain.call({ input: userInput });

      if (response && response.response) {
        const aiResponse = response.response;
        const aiMessage = new AIMessage(aiResponse);
        this.memory.chatHistory.addMessage(aiMessage);
        return aiResponse;
      }
    } catch (error) {
      console.error("ChatBot Error:", error);
      return "An error occurred.";
    }
  }


}

export default ChatBot;
