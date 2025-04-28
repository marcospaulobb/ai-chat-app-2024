// Função para obter variáveis de ambiente com fallback
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  const value = import.meta.env[`VITE_${key}`] || defaultValue;
  console.log(`Variável de ambiente ${key}: ${value ? 'Definida' : 'Não definida'}`);
  return value;
};

// Configuração do ambiente
export const env = {
  openai: {
    apiKey: getEnvVar("OPENAI_API_KEY"),
    model: getEnvVar("OPENAI_MODEL", "gpt-4.1"),
  },
  google: {
    clientId: getEnvVar("GOOGLE_CLIENT_ID"),
    clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    redirectUri: getEnvVar("GOOGLE_REDIRECT_URI", "http://localhost:8080/auth/google/callback"),
  },
  app: {
    name: getEnvVar("APP_NAME", "Orientador Guido"),
    version: getEnvVar("APP_VERSION", "1.0.0"),
  },
};

// Validação das variáveis de ambiente
const requiredEnvVars = [
  "VITE_OPENAI_API_KEY",
  "VITE_GOOGLE_API_KEY",
  "VITE_GOOGLE_SEARCH_ENGINE_ID",
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 