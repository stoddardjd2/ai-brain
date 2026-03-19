import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "AI Review Agent",
  description: "Realtime quality gate and refinement engine"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
