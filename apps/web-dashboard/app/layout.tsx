import "./globals.css";
import { ReactNode } from "react";
import SessionWrapper from "@/components/session-provider";
import TrpcProvider from "@/components/trpc-provider";

export const metadata = {
  title: "Discord Metrics",
  description: "Analytics in real-time for your Discord server"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <SessionWrapper>
          <TrpcProvider>{children}</TrpcProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}