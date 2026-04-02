import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: {
    default: "BabIA - Sua secretária de cuidados pessoais",
    template: "%s | BabIA",
  },
  description:
    "Preencha a agenda, reduza faltas e traga clientes de volta. A secretária inteligente para seu negócio.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "BabIA",
    title: "BabIA - Sua secretária de cuidados pessoais",
    description:
      "Sistema de agendamento inteligente. Seus clientes agendam em 2 minutos. Você preenche a agenda e traz clientes de volta.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#D4A853" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('babia-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${montserrat.variable} font-sans bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 transition-colors`}>{children}</body>
    </html>
  );
}
