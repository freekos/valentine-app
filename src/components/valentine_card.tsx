/* eslint-disable @next/next/no-img-element */
"use client";
import {
  MouseEvent,
  MouseEventHandler,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  ClipboardIcon,
} from "@heroicons/react/20/solid";

import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { telegramBotInstance } from "@/service/telegram";

interface ValentineCardProps {
  data: any;
  showMore?: boolean;
  showAnswer?: boolean;
}

export const ValentineCard = ({
  data,
  showMore = true,
  showAnswer = false,
}: ValentineCardProps) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const copyTextToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Ссылка скопирована в буфер обмена",
      });
    }
  };

  const handleAnswer = async () => {
    try {
      const { data: valentineRes, error: valentineError } = await supabase
        .from("valentines")
        .update({
          answer: 1,
        })
        .eq("id", data.id)
        .single();

      if (!!valentineError) throw new Error(valentineError.message);
      const { data: userRes, error: userError } = await supabase
        .from("users_with_telegram")
        .select("*")
        .eq("user_id", data.user_id)
        .single();

      if (!!userError) throw new Error(userError.message);

      await telegramBotInstance.post("/sendMessage", {
        chat_id: userRes.telegram_id,
        text: `Вам ответили на валентинку:\nДа`,
        parse_mode: "Markdown",
      });

      toast({
        title: "Ответ отправлен",
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Что-то пошло не так",
        description: error.message,
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <div className="rounded overflow-hidden shadow-lg p-4 bg-white">
      <div className="flex justify-center items-center">
        <img
          src={`https://wvvlthtocesqjribslcs.supabase.co/storage/v1/object/public/uploads/${data.file}`}
          alt=""
          className="max-w-sm max-h-72 w-auto h-auto rounded-lg"
        />
      </div>
      <div className="flex justify-end items-center gap-2 mt-2">
        <Link
          href={`https://wvvlthtocesqjribslcs.supabase.co/storage/v1/object/public/uploads/${data.file}`}
          download={data.file}
        >
          <Button size="icon">
            <ArrowUpTrayIcon className="w-5 h-5" />
          </Button>
        </Link>
        <Button
          size="icon"
          onClick={() =>
            copyTextToClipboard(
              `https://valentina-app.netlify.app/valentine/${data.id}`
            )
          }
        >
          <ClipboardIcon className="w-5 h-5" />
        </Button>
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">#{data.id}</div>
        <span className="text-gray-700 text-base">
          Сообщение: <pre className="whitespace-pre-wrap">{data.message}</pre>
        </span>
      </div>
      <div className="px-4 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
          Получатель: {data.recipientTelegram}
        </span>
      </div>
      {showMore && (
        <Button
          className="w-full"
          onClick={() => router.push(`/valentine/${data.id}`)}
        >
          <ArrowRightIcon className="w-5 h-5" />
        </Button>
      )}
      {showAnswer && (
        <div className="flex justify-center gap-4 mt-5">
          <Button
            className="text-lg font-bold font-PlayfairDisplay text-white"
            size="lg"
            onClick={handleAnswer}
          >
            Да
          </Button>
          <AnimatedButton>Нет</AnimatedButton>
        </div>
      )}
    </div>
  );
};

const AnimatedButton = ({ children }: PropsWithChildren) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    const { width, height } = event.currentTarget.getBoundingClientRect();
    const maxValidX = window.innerWidth - width;
    const maxValidY = window.innerHeight - height;
    const randomXInWindow = Math.random() * maxValidX;
    const randomYInWindow = Math.random() * maxValidY;
    setPosition({ x: randomXInWindow, y: randomYInWindow });
  };

  useEffect(() => {
    if (!position) return;
    const timeout = setTimeout(() => {
      setPosition(null);
    }, 18000);
    return () => clearTimeout(timeout);
  }, [position]);

  return (
    <div className="relative">
      <Button
        className="text-lg font-bold font-PlayfairDisplay text-white"
        style={{
          position: position ? "fixed" : "static",
          top: position?.y ?? "unset",
          left: position?.x ?? "unset",
        }}
        size="lg"
        onMouseEnter={handleMouseEnter}
      >
        {children}
      </Button>
    </div>
  );
};
