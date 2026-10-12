import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "mintcommerce — One platform. Three experiences.",
  description: "Explore marketplace administration, seller tools, and a seamless shopping experience in mintcommerce.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
