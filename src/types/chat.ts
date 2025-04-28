export interface Message {
  id: number;
  content: string;
  isAdvisor: boolean;
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
} 