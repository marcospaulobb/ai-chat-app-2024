import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleAuthService } from "@/lib/services/googleAuthService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Obter código de autorização da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("Código de autorização não encontrado");
        }

        // Processar callback de autenticação
        await googleAuthService.handleCallback(code);

        // Redirecionar de volta para a página principal
        navigate("/");
      } catch (error) {
        console.error("Erro ao processar autenticação:", error);
        setError("Falha ao autenticar com o Google. Por favor, tente novamente.");
      }
    };

    processAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 