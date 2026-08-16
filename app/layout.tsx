import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Organizador Pessoal & Financeiro",
  description: "Gerencie suas finanças e tarefas em um só lugar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-textMain min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
