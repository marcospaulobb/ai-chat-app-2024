import { getAuthorizationUrl, exchangeCodeForToken } from "@/config/googleAuth";

// Armazenamento local para tokens
const TOKEN_KEY = "google_auth_token";

export const googleAuthService = {
  // Iniciar processo de autenticação
  initiateAuth: () => {
    const authUrl = getAuthorizationUrl();
    window.location.href = authUrl;
  },

  // Processar callback de autenticação
  handleCallback: async (code: string) => {
    try {
      const tokenData = await exchangeCodeForToken(code);
      
      // Salvar token no localStorage
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
      
      return tokenData;
    } catch (error) {
      console.error("Erro ao processar callback de autenticação:", error);
      throw error;
    }
  },

  // Obter token de acesso
  getAccessToken: (): string | null => {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return null;
    
    const { access_token, expires_in, timestamp } = JSON.parse(tokenData);
    
    // Verificar se o token expirou
    if (timestamp && expires_in) {
      const now = Date.now();
      const expirationTime = timestamp + (expires_in * 1000);
      
      if (now >= expirationTime) {
        console.log("Token expirado, iniciando renovação...");
        // Token expirado, iniciar processo de autenticação novamente
        googleAuthService.initiateAuth();
        return null;
      }
    }
    
    return access_token;
  },

  // Verificar se está autenticado
  isAuthenticated: (): boolean => {
    return !!googleAuthService.getAccessToken();
  },

  // Fazer logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
}; 