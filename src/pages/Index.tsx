import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const { messages, isLoading, error, sendMessage, saveMessageToGoogleDocs, clearHistory } = useChat();

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 hidden md:block">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>GK</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">Prof. Guido Kahneman</h2>
          <p className="text-sm text-muted-foreground">Orientador</p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Área de Especialização:</div>
          <div className="text-sm text-muted-foreground">Economia Comportamental e Python</div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b bg-card flex justify-between items-center">
          <h1 className="text-xl font-semibold">Chat com Orientador</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={clearHistory}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpar histórico de conversas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </header>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isAdvisor={message.isAdvisor}
                timestamp={message.timestamp}
                onSave={message.isAdvisor ? () => saveMessageToGoogleDocs(message.id) : undefined}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Orientador está digitando...</span>
                </div>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          <ChatInput onSendMessage={sendMessage} />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
