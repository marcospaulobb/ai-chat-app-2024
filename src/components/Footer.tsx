import { env } from "@/config/env";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          Modelo: {env.openai.model}
        </div>
        <div className="text-sm text-muted-foreground">
          © 2024 Orientador GPT. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
} 