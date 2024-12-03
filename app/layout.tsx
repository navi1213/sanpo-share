import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { auth } from "@/auth";
<<<<<<< HEAD
import { Toaster } from "@/components/ui/toaster";
=======
import LogoutButton from "./(logged-in)/logout-button";
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11

const fontNotoSansJP = Noto_Sans_JP({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="ja">
      <body
        className={cn(
          "bg-background antialiased min-h-screen",
          fontNotoSansJP.className
        )}
      >
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
