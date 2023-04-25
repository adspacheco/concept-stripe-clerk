import { ClerkProvider } from "@clerk/nextjs/app-beta";
import { ptBR } from "@clerk/localizations";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="en">
        <body className="flex h-screen items-center justify-center">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
