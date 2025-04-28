import { googleAuthService } from "./googleAuthService";
import { env } from "@/config/env";

// URLs da API do Google Docs
const DOCS_API_URL = "https://docs.googleapis.com/v1/documents";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";

// Nome do documento principal
const MAIN_DOCUMENT_TITLE = "Bate-papo com Orientador";

export const googleDocsService = {
  // ID do documento principal (será armazenado no localStorage)
  getMainDocumentId: (): string | null => {
    return localStorage.getItem("main_document_id");
  },

  // Salvar ID do documento principal
  setMainDocumentId: (documentId: string): void => {
    localStorage.setItem("main_document_id", documentId);
  },

  // Criar ou obter o documento principal
  async getOrCreateMainDocument(): Promise<string> {
    try {
      // Verificar se já temos um documento principal
      const existingDocumentId = this.getMainDocumentId();
      if (existingDocumentId) {
        // Verificar se o documento ainda existe
        const accessToken = googleAuthService.getAccessToken();
        if (!accessToken) {
          throw new Error("Usuário não autenticado");
        }

        try {
          const response = await fetch(`${DOCS_API_URL}/${existingDocumentId}`, {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            return existingDocumentId;
          } else if (response.status === 403 || response.status === 401) {
            // Token expirado ou sem permissão, iniciar autenticação novamente
            googleAuthService.initiateAuth();
            throw new Error("Token expirado ou sem permissão");
          } else {
            console.error(`Erro ao verificar documento: ${response.status}`, await response.text());
          }
        } catch (error) {
          console.warn("Documento principal não encontrado, criando um novo");
        }
      }

      // Criar um novo documento principal
      const accessToken = googleAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error("Usuário não autenticado");
      }

      console.log("Criando novo documento principal...");
      const createResponse = await fetch(DOCS_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: MAIN_DOCUMENT_TITLE,
        }),
      });

      if (!createResponse.ok) {
        if (createResponse.status === 403 || createResponse.status === 401) {
          // Token expirado ou sem permissão, iniciar autenticação novamente
          googleAuthService.initiateAuth();
          throw new Error("Token expirado ou sem permissão");
        }
        console.error(`Erro ao criar documento: ${createResponse.status}`, await createResponse.text());
        throw new Error("Falha ao criar documento principal");
      }

      const document = await createResponse.json();
      const documentId = document.documentId;
      console.log("Documento criado com sucesso:", documentId);

      // Salvar o ID do documento principal
      this.setMainDocumentId(documentId);

      // Tornar o documento acessível via link
      console.log("Compartilhando documento...");
      const shareResponse = await fetch(`${DRIVE_API_URL}/${documentId}?fields=webViewLink`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      });

      if (!shareResponse.ok) {
        console.error(`Erro ao compartilhar documento: ${shareResponse.status}`, await shareResponse.text());
      } else {
        console.log("Documento compartilhado com sucesso");
      }

      return documentId;
    } catch (error) {
      console.error("Erro ao obter/criar documento principal:", error);
      throw error;
    }
  },

  async saveToGoogleDocs(content: string): Promise<{ success: boolean; documentUrl?: string }> {
    try {
      // Verificar autenticação
      const accessToken = googleAuthService.getAccessToken();
      if (!accessToken) {
        console.warn("Usuário não autenticado no Google");
        return { success: false };
      }

      // Obter ou criar o documento principal
      console.log("Obtendo documento principal...");
      const documentId = await this.getOrCreateMainDocument();
      console.log("Documento principal obtido:", documentId);

      // Obter o documento atual para verificar seu conteúdo
      console.log("Obtendo conteúdo do documento...");
      const getResponse = await fetch(`${DOCS_API_URL}/${documentId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!getResponse.ok) {
        if (getResponse.status === 403 || getResponse.status === 401) {
          // Token expirado ou sem permissão, iniciar autenticação novamente
          googleAuthService.initiateAuth();
          throw new Error("Token expirado ou sem permissão");
        }
        console.error(`Erro ao obter documento: ${getResponse.status}`, await getResponse.text());
        throw new Error("Falha ao obter documento");
      }

      const document = await getResponse.json();
      console.log("Conteúdo do documento obtido com sucesso");
      
      // Determinar o índice para inserir o novo conteúdo
      let insertIndex = 1;
      if (document.body && document.body.content && document.body.content.length > 0) {
        // Se o documento já tem conteúdo, inserir no final
        const lastElement = document.body.content[document.body.content.length - 1];
        if (lastElement.endIndex) {
          insertIndex = lastElement.endIndex - 1; // Subtrair 1 para garantir que o índice seja válido
        }
      }
      console.log("Índice de inserção:", insertIndex);

      // Adicionar separador e timestamp
      const timestamp = new Date().toLocaleString();
      const formattedContent = `\n\n--- Mensagem de ${timestamp} ---\n\n${content}`;
      console.log("Conteúdo formatado:", formattedContent.substring(0, 50) + "...");

      // Inserir conteúdo no documento
      console.log("Inserindo conteúdo no documento...");
      const updateResponse = await fetch(`${DOCS_API_URL}/${documentId}:batchUpdate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: {
                  index: insertIndex,
                },
                text: formattedContent,
              },
            },
          ],
        }),
      });

      if (!updateResponse.ok) {
        if (updateResponse.status === 403 || updateResponse.status === 401) {
          // Token expirado ou sem permissão, iniciar autenticação novamente
          googleAuthService.initiateAuth();
          throw new Error("Token expirado ou sem permissão");
        }
        const errorText = await updateResponse.text();
        console.error(`Erro ao inserir conteúdo: ${updateResponse.status}`, errorText);
        throw new Error(`Falha ao inserir conteúdo no documento: ${errorText}`);
      }

      console.log("Conteúdo inserido com sucesso");

      // Obter o link do documento
      console.log("Obtendo link do documento...");
      const shareResponse = await fetch(`${DRIVE_API_URL}/${documentId}?fields=webViewLink`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!shareResponse.ok) {
        if (shareResponse.status === 403 || shareResponse.status === 401) {
          // Token expirado ou sem permissão, iniciar autenticação novamente
          googleAuthService.initiateAuth();
          throw new Error("Token expirado ou sem permissão");
        }
        console.error(`Erro ao obter link: ${shareResponse.status}`, await shareResponse.text());
        throw new Error("Falha ao obter link do documento");
      }

      const { webViewLink } = await shareResponse.json();
      console.log("Link do documento obtido:", webViewLink);

      return {
        success: true,
        documentUrl: webViewLink,
      };
    } catch (error) {
      console.error("Erro ao salvar no Google Docs:", error);
      return { success: false };
    }
  }
}; 