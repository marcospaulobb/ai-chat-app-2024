import { env } from "@/config/env";
import { advisorPrompt } from "@/config/advisorPrompt";
import OpenAI from "openai";
import { Message } from "@/types/chat";
import { chatHistory } from "./chatHistory";

const openai = new OpenAI({
  apiKey: env.openai.apiKey,
  dangerouslyAllowBrowser: true // Apenas para desenvolvimento
});

// Função para formatar a resposta
const formatResponse = (text: string): string => {
  // Remove asteriscos entre frases
  let formatted = text.replace(/\*\*/g, '');
  
  // Adiciona quebras de linha entre parágrafos
  formatted = formatted.replace(/([.!?])\s+/g, '$1\n\n');
  
  // Remove quebras de linha extras
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
};

export const aiService = {
  async searchGoogle(query: string): Promise<string> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${env.google.apiKey}&cx=${env.google.searchEngineId}&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        console.warn("Falha na busca do Google, usando resposta simulada");
        return "Resultados simulados da busca para desenvolvimento";
      }

      const data = await response.json();
      return data.items
        .map((item: any) => `${item.title}\n${item.snippet}`)
        .join("\n\n");
    } catch (error) {
      console.warn("Erro na busca do Google, usando resposta simulada");
      return "Resultados simulados da busca para desenvolvimento";
    }
  },

  async generateResponse(message: string, context: string = ""): Promise<string> {
    try {
      // Obtém o histórico de mensagens
      const history = chatHistory.getHistory();
      
      // Prepara as mensagens para o OpenAI
      const messages = [
        { 
          role: "system", 
          content: `${advisorPrompt}\n\nIMPORTANTE: Ao responder, siga estas regras de formatação:\n1. Use quebras de linha duplas (\\n\\n) entre parágrafos\n2. Use quebras de linha simples (\\n) para listas\n3. Não use asteriscos entre frases\n4. Use markdown para títulos (# para títulos principais, ## para subtítulos)\n5. Use - para listas com marcadores\n6. Use 1. 2. 3. para listas numeradas\n7. Mantenha um espaço em branco antes e depois de cada título\n8. Mantenha um espaço em branco antes e depois de cada lista`,
        }
      ];
      
      // Adiciona o histórico de mensagens (limitado a 5 mensagens para não exceder o limite de tokens)
      const recentHistory = history.slice(-5);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.isAdvisor ? "assistant" : "user",
          content: msg.content
        });
      }
      
      // Adiciona o contexto da busca
      if (context) {
        messages.push({ 
          role: "user", 
          content: `Contexto adicional: ${context}` 
        });
      }
      
      // Adiciona a mensagem atual
      messages.push({ 
        role: "user", 
        content: message 
      });

      const completion = await openai.chat.completions.create({
        model: env.openai.model,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content || "Desculpe, não consegui gerar uma resposta.";
      return response;
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      return "Desculpe, estou tendo problemas para processar sua mensagem. Por favor, tente novamente mais tarde.";
    }
  },

  async processMessage(message: string): Promise<Message> {
    try {
      // Busca informações relevantes no Google
      const searchResults = await this.searchGoogle(message);
      
      // Gera resposta usando OpenAI com o contexto da busca
      const response = await this.generateResponse(message, searchResults);

      // Cria o objeto de mensagem
      const messageObj: Message = {
        id: Date.now(),
        content: response,
        isAdvisor: true,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
      };
      
      // Adiciona a mensagem ao histórico
      chatHistory.addMessage(messageObj);

      return messageObj;
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      return {
        id: Date.now(),
        content: "Desculpe, estou tendo problemas para processar sua mensagem. Por favor, tente novamente mais tarde.",
        isAdvisor: true,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
      };
    }
  },

  formatResponse(response: string): string {
    // Primeiro, vamos dividir o texto em parágrafos
    let paragraphs = response.split(/\n+/);
    
    // Processar cada parágrafo
    paragraphs = paragraphs.map(paragraph => {
      // Remover asteriscos
      paragraph = paragraph.replace(/\*\*/g, '');
      
      // Formatar títulos (começando com #)
      if (paragraph.trim().startsWith('#')) {
        const level = paragraph.match(/^#+/)[0].length;
        const title = paragraph.replace(/^#+\s*/, '').trim();
        return `\n\n${'#'.repeat(level)} ${title}\n\n`;
      }
      
      // Formatar listas numeradas
      if (paragraph.trim().match(/^\d+\./)) {
        return `\n\n${paragraph.trim()}\n`;
      }
      
      // Formatar listas com marcadores
      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
        return `\n\n${paragraph.trim()}\n`;
      }
      
      // Adicionar quebras de linha após pontuação
      paragraph = paragraph.replace(/([.!?])\s+/g, '$1\n\n');
      
      return paragraph;
    });
    
    // Juntar os parágrafos com quebras de linha duplas
    let formattedText = paragraphs.join('\n\n');
    
    // Garantir que haja quebras de linha duplas entre parágrafos
    formattedText = formattedText.replace(/\n{2,}/g, '\n\n');
    
    // Garantir que o texto comece com uma quebra de linha
    if (!formattedText.startsWith('\n\n')) {
      formattedText = '\n\n' + formattedText;
    }
    
    return formattedText;
  }
}; 