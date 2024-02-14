"use client";
import { useEffect, useState } from "react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { ValentinesGrid } from "./valentines_list";

interface RealtimeReceivedValentinesProps {
  data: any[];
  session: Session | null;
}

export const RealtimeReceivedValentines = ({
  data,
  session,
}: RealtimeReceivedValentinesProps) => {
  const supabase = createClientComponentClient();
  const [valentines, setValentines] = useState<any[]>(data);

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "valentines",
        },
        (payload) => {
          if (session && payload.new.recipientTelegram === session.user.id) {
            setValentines((prev: any) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <ValentinesGrid data={valentines} />;
};
