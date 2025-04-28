import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isAdvisor: boolean;
  timestamp: string;
  onSave?: () => void;
}

export const ChatMessage = ({ content, isAdvisor, timestamp, onSave }: ChatMessageProps) => {
  // Função para converter quebras de linha em elementos <br> e formatar texto em negrito
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Verifica se a linha começa com sinais gráficos
      const formattedLine = line.replace(/^([#\-*])\s+(.+)$/, (_, symbol, content) => {
        return `<strong>${content}</strong>`;
      });

      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
          <br />
        </span>
      );
    });
  };

  return (
    <div className={cn(
      "flex mb-4",
      isAdvisor ? "justify-start" : "justify-end"
    )}>
      <div className="flex flex-col">
        <div className={cn(
          "chat-bubble message-enter whitespace-pre-wrap",
          isAdvisor ? "chat-bubble-advisor" : "chat-bubble-student"
        )}>
          {formatContent(content)}
        </div>
        <div className="flex items-center justify-between mt-1 px-2">
          <span className="text-xs text-muted-foreground">
            {timestamp}
          </span>
          {isAdvisor && onSave && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={onSave}
            >
              <Save className="h-3 w-3 mr-1" />
              Salvar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
