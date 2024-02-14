"use client";
import { TelegramForm } from "@/components/telegram_form";
import { Session } from "@supabase/auth-helpers-nextjs";

interface AuthProps {
  session: Session | null;
}

export default function Auth({ session }: AuthProps) {
  return (
    <>
      <section className="h-full py-20 px-3">
        <div className="flex flex-col justify-center items-center space-y-20 h-full">
          {!session && <TelegramForm />}
        </div>
      </section>
    </>
  );
}
