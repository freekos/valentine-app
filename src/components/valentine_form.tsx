/* eslint-disable @next/next/no-img-element */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { telegramBotInstance } from "@/service/telegram";
import Link from "next/link";
import { memo } from "react";
import { useToast } from "./ui/use-toast";

const valentineSchema = z.object({
  file: z.any(),
  message: z.string().min(1, { message: "Сообщение является обязательным" }),
  recipientTelegram: z
    .string()
    .min(1, { message: "Телеграм получателя обязателен" }),
});

type ValentineSchema = z.infer<typeof valentineSchema>;

interface ValentineFormProps {
  session: Session;
}

const ValentineFormView = ({ session }: ValentineFormProps) => {
  const supabase = createClientComponentClient();
  const form = useForm<ValentineSchema>({
    defaultValues: {
      file: null,
      message: "",
      recipientTelegram: "",
    },
    resolver: zodResolver(valentineSchema),
  });
  const { toast } = useToast();

  const handleSubmit = async (data: ValentineSchema) => {
    try {
      let filePath = "default.gif";

      if (!!data.file) {
        const file = data.file as File;
        const fileName = `${file.name}-${new Date(Date.now()).toISOString()}`;
        const { data: res, error } = await supabase.storage
          .from("uploads")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });
        if (!!error) throw new Error(error.message);

        filePath = res.path;
      }

      const valentine = {
        ...data,
        user_id: session.user.id,
        file: filePath,
      };
      const { data: valentineRes, error: valentineError } = await supabase
        .from("valentines")
        .insert(valentine)
        .select();

      if (!!valentineError) throw new Error(valentineError.message);

      toast({
        title: "Вы успешно отправили валентинку",
        className: "bg-green-500 text-white",
      });

      const valentineValue = valentineRes![0] as any;

      const { data: messages } = await telegramBotInstance.get("/getUpdates");
      console.log(messages);
      const messageIndex = messages.result.findIndex(
        (item: any) =>
          item.message?.chat.username ===
          data.recipientTelegram.replace("@", "")
      );
      console.log(messageIndex);
      if (messageIndex === -1)
        throw new Error(
          "Ошибка при отправке сообщения в телеграм, возможно пользователь не обращался к боту!"
        );
      const username = session.user.user_metadata.username;
      console.log(session);
      await telegramBotInstance.post("/sendMessage", {
        chat_id: messages.result[messageIndex].message.chat.id,
        text: `Урааа вам пришла валентинка!\nОт пользователя @${username}\nВы можете посмотреть приглашение перейдя на ссылку: https://valentina-app.netlify.app/valentine/${valentineValue.id}`,
        parse_mode: "Markdown",
      });
      await telegramBotInstance.post("/sendMessage", {
        chat_id: session.user.user_metadata.id,
        text: `Вы отправили валентинку пользователю @${messages.result[messageIndex].message.chat.username}\nВалентинка: https://valentina-app.netlify.app/valentine/${valentineValue.id}`,
        parse_mode: "Markdown",
      });

      toast({
        title: "Валентинка успешно отправлена получателю через Telegram",
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title:
          "message" in error ? error.message : "Ошибка при отправке валентники",
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <>
      <h2 className="text-2xl text-center font-PlayfairDisplay">
        Создать валентинку
      </h2>
      <Form {...form}>
        <form
          className="w-full max-w-lg mx-auto space-y-5"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex justify-center items-center">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value } }) => (
                <img
                  src={
                    value
                      ? URL.createObjectURL(value)
                      : "https://wvvlthtocesqjribslcs.supabase.co/storage/v1/object/public/uploads/default.gif"
                  }
                  className="max-w-sm w-auto h-auto rounded-lg"
                  alt=""
                />
              )}
            />
          </div>
          <fieldset
            className="space-y-5"
            disabled={form.formState.isSubmitting}
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem className="space-y-1">
                  <Label htmlFor={field.name}>Выберите файл</Label>
                  <Input
                    type="file"
                    placeholder="Выберите файл"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    onChange={(event) => onChange(event.target.files![0])}
                    {...field}
                  />
                  <FormDescription>
                    <Link
                      href="https://gifer.com/en/gifs/valentine"
                      target="_blank"
                      className="text-base"
                    >
                      Ссылка на гифки
                    </Link>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label htmlFor={field.name}>Сообщение</Label>

                  <Textarea
                    placeholder="Привет..."
                    className="h-[100px] max-h-[500px] shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...field}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientTelegram"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label htmlFor={field.name}>Телеграм</Label>
                  <Input
                    placeholder="Введите телеграм получателя"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            Отправить
          </Button>
        </form>
      </Form>
    </>
  );
};

export const ValentineForm = memo(ValentineFormView);
