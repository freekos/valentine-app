/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import crypto from "crypto";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { telegramBotInstance } from "@/service/telegram";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

interface TelegramUser {
  auth_date: number;
  first_name: string;
  hash: string;
  id: number;
  photo_url: string;
  username: string;
}

const telegramSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Почта является обязательным полем" })
      .email({ message: "Неправильный формат почты" }),
    password: z.string(),
    has_telegram: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.has_telegram && data.password.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Пароль является обязательным полем",
        path: ["password"],
      });
    }
  });

type TelegramSchema = z.infer<typeof telegramSchema>;

export const TelegramForm = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const telegramWrapperRef = useRef<HTMLDivElement>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const form = useForm<TelegramSchema>({
    defaultValues: {
      email: "",
      password: "",
      has_telegram: false,
    },
    resolver: zodResolver(telegramSchema),
  });
  const isSignUpView = !!telegramUser;

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const handleSignUp = async ({
    email,
    password,
    user,
  }: {
    email: string;
    password: string;
    user: TelegramUser;
  }) => {
    const { data: usersWithUsername, error: usernameError } = await supabase
      .from("users_with_telegram")
      .select("*")
      .eq("username", user.username);

    if (usernameError || usersWithUsername.length !== 0) {
      return {
        data: null,
        error:
          usernameError ||
          new Error("A user with this username already exists."),
      };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            ...user,
          },
        },
      }
    );

    if (!!signUpError) return { data: null, error: signUpError };

    const { data: telegramSignUpData, error: telegramSignUpError } =
      await supabase.from("users_with_telegram").insert({
        user_id: signUpData.user?.id,
        telegram_id: signUpData.user?.user_metadata.id,
        username: signUpData.user?.user_metadata.username,
      });
    if (!!telegramSignUpError)
      return { data: null, error: telegramSignUpError };

    return { data: telegramSignUpData, error: null };
  };

  const handleSubmit = async (data: TelegramSchema) => {
    if (!!data.has_telegram) {
      if (!telegramUser) return;
      const user = telegramUser;
      const email = data.email;
      const password = crypto
        .createHash("sha256")
        .update(user.hash)
        .digest("hex")
        .substring(0, 6);

      const { error } = await handleSignUp({ email, password, user });

      if (!error) {
        toast({
          title: "Вы успешно зарегистрировались",
          className: "bg-red-500 text-white",
        });
        try {
          const { data: message } = await telegramBotInstance.post(
            "/sendMessage",
            {
              chat_id: user.id,
              text: `Добро пожаловать в приложение валентина!\nДля вашего аккаунта: @${user.username} был сгенерирован пароль: \`\`\`copy\n${password}\`\`\``,
              parse_mode: "Markdown",
            }
          );
          await telegramBotInstance.post("/pinChatMessage", null, {
            params: {
              chat_id: user.id,
              message_id: message.response.message_id,
            },
          });
        } catch (error) {
          console.error(error);
        } finally {
          setTelegramUser(null);
        }
      } else {
        toast({
          title: error.message,
          className: "bg-red-500 text-white",
        });
      }
    } else {
      const { error } = await handleSignIn({
        email: data.email,
        password: data.password,
      });
      if (!error) {
        router.refresh();
      }
    }
  };

  const handleTelegramClear = () => {
    setTelegramUser(null);
    form.setValue("has_telegram", false);
  };

  useEffect(() => {
    if (!telegramWrapperRef.current) return;
    const element = telegramWrapperRef.current;

    (window as any).handleTelegramOnAuth = async (user: TelegramUser) => {
      setTelegramUser(user);
      form.setValue("has_telegram", true);
    };

    const scriptElement = document.createElement("script");
    scriptElement.src = "https://telegram.org/js/telegram-widget.js?22";
    scriptElement.setAttribute("data-telegram-login", "valentina_app_bot");
    scriptElement.setAttribute("data-size", "large");
    scriptElement.setAttribute("data-onauth", "handleTelegramOnAuth(user)");
    scriptElement.setAttribute("data-request-access", "write");
    if (!telegramUser) {
      telegramWrapperRef.current.appendChild(scriptElement);
    }

    return () => {
      delete (window as any).handleTelegramOnAuth;
      element.innerHTML = "";
    };
  }, [telegramUser]);

  return (
    <>
      <h2 className="text-2xl text-center font-PlayfairDisplay">
        {isSignUpView ? "Регистрация" : "Войти"}
      </h2>
      <Form {...form}>
        <form
          className="w-full max-w-xs mx-auto space-y-3"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <fieldset
            className="space-y-5"
            disabled={form.formState.isSubmitting}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Почта*</FormLabel>
                  <Input type="email" placeholder="Введите почту" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isSignUpView && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Пароль*</FormLabel>
                    <Input
                      type="password"
                      placeholder="Введите пароль"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </fieldset>
          <div className="flex flex-col justify-between items-center gap-y-3 sm:flex-row sm:items-start">
            <div>
              <div
                className="flex justify-center items-center"
                ref={telegramWrapperRef}
              />
              {!!telegramUser && (
                <div className="flex items-center gap-x-2">
                  <div className="flex justify-center items-center py-1.5 px-4 bg-[#54a9eb] rounded-full">
                    <h5 className="text-white">@{telegramUser.username}</h5>
                  </div>
                  <img
                    className="rounded-full"
                    src={telegramUser.photo_url}
                    width={40}
                    height={40}
                    alt="telegram_photo"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="max-sm:w-full"
              size="icon"
              disabled={form.formState.isSubmitting}
            >
              <ArrowRightIcon className="w-6 h-6" />
            </Button>
          </div>
          {isSignUpView && (
            <Button type="button" variant="link" onClick={handleTelegramClear}>
              Авторизоваться
            </Button>
          )}
        </form>
      </Form>
    </>
  );
};
