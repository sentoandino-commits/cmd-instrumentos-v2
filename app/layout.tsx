import type { Metadata } from "next";
import "./globals.css";
import BienvenidaModal from "@/components/BienvenidaModal";

export const metadata: Metadata = {
  title: "Fichero de instrumentos andinos",
  description:
    "Catálogo de investigación de instrumentos musicales andinos — Universidad de Tarapacá",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">
        <div className="h-1 bg-clay" />
        <BienvenidaModal />
        {children}
      </body>
    </html>
  );
}
