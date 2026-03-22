import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equilibrios Hídricos Neonatales",
  description:
    "Calculadora clínica de equilibrios hídricos neonatales para apoyo en la valoración de pérdidas insensibles, líquidos reales, balance hídrico total y uresis horaria.",
  openGraph: {
    title: "Equilibrios Hídricos Neonatales",
    description:
      "Calculadora clínica de equilibrios hídricos neonatales para apoyo en la valoración de pérdidas insensibles, líquidos reales, balance hídrico total y uresis horaria.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Equilibrios Hídricos Neonatales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Equilibrios Hídricos Neonatales",
    description:
      "Calculadora clínica de equilibrios hídricos neonatales para apoyo en la valoración de pérdidas insensibles, líquidos reales, balance hídrico total y uresis horaria.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
