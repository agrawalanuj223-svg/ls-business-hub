import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "L&S Business Hub",
  description: "Secure DEMO/SAMPLE business operations portal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
