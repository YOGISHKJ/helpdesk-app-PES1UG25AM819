// Yogish K J | PES1UG25AM819
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Campus Help Desk Board", description: "A campus community help request board." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
