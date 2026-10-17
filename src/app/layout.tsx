import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Circuitos — laboratório CC",
  description: "Monte, analise e compartilhe circuitos resistivos.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
