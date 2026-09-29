import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIP Registral | Información territorial autorizada",
  description: "Plataforma privada para organizar proyectos, lotes y certificados autorizados.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
