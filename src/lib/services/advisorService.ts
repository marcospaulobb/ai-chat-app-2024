import { Message } from "@/types/chat";
import { aiService } from "./aiService";

export const advisorService = {
  async sendMessage(message: string): Promise<Message> {
    try {
      return await aiService.processMessage(message);
    } catch (error) {
      console.error("Erro no serviço do orientador:", error);
      throw error;
    }
  }
}; 