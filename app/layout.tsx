import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equilibrios Hídricos Neonatales",
  description:
    "Calculadora clínica de equilibrios hídricos neonatales para apoyo en la valoración de pérdidas insensibles, líquidos reales, balance hídrico total y uresis horaria.",
  applicationName: "Equilibrios Hídricos Neonatales",
  authors: [{ name: "Dr. Cristopher Iglesias" }],
  creator: "Dr. Cristopher Iglesias",
  publisher: "Dr. Cristopher Iglesias",
  openGraph: {
    title: "Equilibrios Hídricos Neonatales",
    description:
      "Calculadora clínica de equilibrios hídricos neonatales para apoyo en la valoración de pérdidas insensibles, líquidos reales, balance hídrico total y uresis horaria.",
    siteName: "Equilibrios Hídricos Neonatales",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Equilibrios Hídricos Neonatales",
    description:
      "Calculadora clínica de equilibrios hídricos neonatales para apoyo en la valoración de pérdidas insensibles, líquidos reales, balance hídrico total y uresis horaria.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
