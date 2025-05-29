import { Providers } from "@/components/providers";
import "@/globals.css";

export const metadata = {
  title: "Discord Metrics",
  description: "Analytics in real-time for your Discord server",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}