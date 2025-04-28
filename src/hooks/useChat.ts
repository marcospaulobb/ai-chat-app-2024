import { useState, useEffect } from "react";
import { Message, ChatState } from "@/types/chat";
import { advisorService } from "@/lib/services/advisorService";
import { googleDocsService } from "@/lib/services/googleDocsService";
import { googleAuthService } from "@/lib/services/googleAuthService";
import { useToast } from "@/hooks/use-toast";
import { chatHistory } from "@/lib/services/chatHistory";

export const useChat = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });

  // Carrega o histórico ao inicializar
  useEffect(() => {
    const history = chatHistory.getHistory();
    if (history.length > 0) {
      setState(prev => ({
        ...prev,
        messages: history
      }));
    }
  }, []);

  const sendMessage = async (content: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Adiciona mensagem do usuário
      const userMessage: Message = {
        id: Date.now(),
        content,
        isAdvisor: false,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };

      // Adiciona a mensagem do usuário ao estado e ao histórico
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));
      chatHistory.addMessage(userMessage);

      // Obtém resposta do orientador
      const advisorResponse = await advisorService.sendMessage(content);
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, advisorResponse],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Erro ao enviar mensagem. Tente novamente."
      }));
    }
  };

  const saveMessageToGoogleDocs = async (messageId: number) => {
    try {
      // Verificar autenticação
      if (!googleAuthService.isAuthenticated()) {
        // Iniciar processo de autenticação
        toast({
          title: "Autenticação necessária",
          description: "Você será redirecionado para fazer login no Google.",
        });
        googleAuthService.initiateAuth();
        return;
      }

      const message = state.messages.find(m => m.id === messageId);
      if (!message) {
        toast({
          title: "Erro",
          description: "Mensagem não encontrada",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Salvando...",
        description: "Salvando mensagem no Google Docs",
      });

      const result = await googleDocsService.saveToGoogleDocs(message.content);
      
      if (result.success && result.documentUrl) {
        toast({
          title: "Sucesso",
          description: "Mensagem salva no Google Docs. Clique para abrir.",
          action: {
            label: "Abrir",
            onClick: () => window.open(result.documentUrl, "_blank")
          }
        });
        return true;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar no Google Docs. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error);
      
      if (error instanceof Error && error.message.includes("Token expirado")) {
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Você será redirecionado para fazer login novamente.",
        });
        googleAuthService.initiateAuth();
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar a mensagem. Tente novamente.",
          variant: "destructive"
        });
      }
      
      return false;
    }
  };

  const clearHistory = () => {
    chatHistory.clearHistory();
    setState(prev => ({
      ...prev,
      messages: []
    }));
  };

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    saveMessageToGoogleDocs,
    clearHistory
  };
}; 