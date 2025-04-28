import { env } from "./env";

// Configurações para autenticação OAuth2 do Google
export const googleAuthConfig = {
  clientId: env.google.clientId || "",
  clientSecret: env.google.clientSecret || "",
  redirectUri: env.google.redirectUri || "http://localhost:8080/auth/google/callback",
  scopes: [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.file"
  ],
  authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

// Função para gerar URL de autorização
export const getAuthorizationUrl = () => {
  console.log("Configurações OAuth:", {
    clientId: googleAuthConfig.clientId,
    redirectUri: googleAuthConfig.redirectUri,
    scopes: googleAuthConfig.scopes
  });

  const params = new URLSearchParams({
    client_id: googleAuthConfig.clientId,
    redirect_uri: googleAuthConfig.redirectUri,
    response_type: "code",
    scope: googleAuthConfig.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `${googleAuthConfig.authEndpoint}?${params.toString()}`;
  console.log("URL de autorização:", authUrl);
  return authUrl;
};

// Função para trocar código de autorização por token de acesso
export const exchangeCodeForToken = async (code: string) => {
  console.log("Trocando código por token...");
  
  const params = new URLSearchParams({
    client_id: googleAuthConfig.clientId,
    client_secret: googleAuthConfig.clientSecret,
    redirect_uri: googleAuthConfig.redirectUri,
    grant_type: "authorization_code",
    code,
  });

  try {
    const response = await fetch(googleAuthConfig.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na resposta:", errorData);
      throw new Error(`Falha ao obter token de acesso: ${errorData.error}`);
    }

    const tokenData = await response.json();
    console.log("Token obtido com sucesso");
    return tokenData;
  } catch (error) {
    console.error("Erro ao trocar código por token:", error);
    throw error;
  }
}; 