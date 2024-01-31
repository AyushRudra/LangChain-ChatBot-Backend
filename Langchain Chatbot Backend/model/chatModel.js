import { BufferMemory, ChatMessageHistory, ConversationSummaryMemory } from "langchain/memory";
import { HumanMessage, AIMessage } from "langchain/schema";
import { OpenAI } from "@langchain/openai";
import { ConversationChain, LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const history = new ChatMessageHistory();
const conversationMemory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: new OpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
});

class ChatBot {
  constructor() {
    this.memory = new BufferMemory({ chatHistory: history });
    this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    this.chain = new ConversationChain({
      llm: this.model,
      memory: this.memory,
    });

    this.summaryChain = new LLMChain({
      llm: new OpenAI({ modelName: "gpt-3.5-turbo", temperature: 0.9 }),
      prompt: PromptTemplate.fromTemplate(
        "Current conversation: {chat_history}\nHuman: {input}\nAI:"
      ),
      memory: conversationMemory,
    });
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
        return uniqueMessages.map((message) => message.text);
      }

      // Add human message to chat history
      const humanMessage = new HumanMessage(userInput);
      this.memory.chatHistory.addMessage(humanMessage);

      // Call ConversationChain to generate AI response
      const response = await this.chain.call({ input: userInput });

      if (response && response.response) {
        // Add AI message to chat history
        const aiResponse = response.response;
        const aiMessage = new AIMessage(aiResponse);
        this.memory.chatHistory.addMessage(aiMessage);

        // Update conversation summary memory (if applicable)
        if (conversationMemory.updateMemoryVariables) {
          await conversationMemory.updateMemoryVariables();
        }
        
        return aiResponse;
      }
    } catch (error) {
      console.error("ChatBot Error:", error);
      return "An error occurred.";
    }
  }
}

export default ChatBot;
