import { Message } from "@/types/chat";

// Número máximo de mensagens a serem mantidas no histórico
const MAX_HISTORY_LENGTH = 10;

// Armazena o histórico de mensagens
let messageHistory: Message[] = [];

export const chatHistory = {
  // Adiciona uma mensagem ao histórico
  addMessage(message: Message): void {
    messageHistory.push(message);
    
    // Limita o tamanho do histórico
    if (messageHistory.length > MAX_HISTORY_LENGTH) {
      messageHistory = messageHistory.slice(-MAX_HISTORY_LENGTH);
    }
    
    // Salva no localStorage para persistência
    this.saveToLocalStorage();
  },
  
  // Obtém o histórico completo
  getHistory(): Message[] {
    return [...messageHistory];
  },
  
  // Limpa o histórico
  clearHistory(): void {
    messageHistory = [];
    this.saveToLocalStorage();
  },
  
  // Salva o histórico no localStorage
  saveToLocalStorage(): void {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messageHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
    }
  },
  
  // Carrega o histórico do localStorage
  loadFromLocalStorage(): void {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        messageHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
    }
  }
};

// Carrega o histórico ao inicializar
chatHistory.loadFromLocalStorage(); 