/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface HeaderProps {
  session: Session | null;
}

export const Header = ({ session }: HeaderProps) => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-[#f43f5e] text-white">
      <div className="max-w-6xl h-[70px] mx-auto px-4">
        <div className="h-full flex justify-between items-center py-4">
          <div className="h-full flex items-center">
            <img className="h-full" src="/logo.png" alt="" />
            <span className="text-lg font-bold">Valentina</span>
          </div>
          <nav className="flex-1 text-center">
            {/* <Link
              href="/"
              className="px-4 py-2 inline-block text-white hover:text-gray-200"
            >
              Home
            </Link> */}
          </nav>

          {!!session && <Button onClick={handleSignOut}>Выйти</Button>}
        </div>
      </div>
    </header>
  );
};
