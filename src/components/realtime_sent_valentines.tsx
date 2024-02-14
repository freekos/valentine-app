"use client";
import { useEffect, useState } from "react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { ValentinesGrid } from "./valentines_list";

interface RealtimeSentValentinesProps {
  data: any[];
  session: Session | null;
}

export const RealtimeSentValentines = ({
  data,
  session,
}: RealtimeSentValentinesProps) => {
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
          if (session && payload.new.user_id === session.user.id) {
            console.log(payload);
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
