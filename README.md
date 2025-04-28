# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7cf5366c-71a9-473f-8138-4aa431b3d596

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7cf5366c-71a9-473f-8138-4aa431b3d596) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Deploy no Vercel

Para fazer o deploy do projeto no Vercel:

1. Crie uma conta no [Vercel](https://vercel.com) se ainda não tiver uma
2. Instale o Vercel CLI globalmente:
   ```bash
   npm install -g vercel
   ```
3. Faça login no Vercel via CLI:
   ```bash
   vercel login
   ```
4. Na raiz do projeto, execute:
   ```bash
   vercel
   ```
5. Siga as instruções do CLI para configurar o projeto
6. Configure as variáveis de ambiente no dashboard do Vercel:
   - VITE_GOOGLE_CLIENT_ID
   - VITE_GOOGLE_CLIENT_SECRET
   - VITE_GOOGLE_REDIRECT_URI (atualize para o domínio do Vercel)
   - VITE_OPENAI_MODEL

Para atualizações futuras, basta fazer push para o repositório conectado ao Vercel ou executar `vercel` novamente.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7cf5366c-71a9-473f-8138-4aa431b3d596) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Orientador Guido

Aplicação de chat com orientador acadêmico usando IA.

## Configuração do Google OAuth

Para usar a funcionalidade de salvar mensagens no Google Docs, você precisa configurar as credenciais OAuth do Google:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs do Google Docs e Google Drive
4. Configure a tela de consentimento OAuth:
   - Tipo de usuário: Externo
   - Escopo: Apenas para testes
   - Informações do aplicativo: Nome, email, etc.
   - Escopos: Google Docs API, Google Drive API
5. Crie credenciais OAuth:
   - Tipo: Aplicativo Web
   - Nome: Orientador Guido
   - URIs de redirecionamento autorizados: http://localhost:8080/auth/google/callback
6. Copie o Client ID e Client Secret
7. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_GOOGLE_CLIENT_ID=seu-client-id
VITE_GOOGLE_CLIENT_SECRET=seu-client-secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## Funcionalidades

- Chat com orientador acadêmico usando IA
- Salvar mensagens no Google Docs
- Interface moderna e responsiva
