import { ReactNode } from "react";
import type { Metadata } from "next";
import { Playfair_Display, Merriweather } from "next/font/google";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { clsx } from "clsx";

import "./globals.css";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({ subsets: ["latin"] });
const merriweather = Merriweather({ subsets: ["latin"], weight: "300" });

export const metadata: Metadata = {
  title: "Valentina",
  description: "App for create vlaentine and share its",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={clsx(
          "flex flex-col",
          playfair.className,
          merriweather.className
        )}
      >
        <Header session={session} />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
