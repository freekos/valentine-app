import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { ValentineForm } from "@/components/valentine_form";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Auth from "./auth";
import { RealtimeSentValentines } from "@/components/realtime_sent_valentines";
import { RealtimeReceivedValentines } from "@/components/realtime_received_valentines";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <Auth session={session} />;
  }

  const { data: sentValentines } = await supabase
    .from("valentines")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const { data: receivedValentines } = await supabase
    .from("valentines")
    .select("*")
    .eq("recipientTelegram", `@${session.user.user_metadata.username}`)
    .order("created_at", { ascending: false });

  return (
    <>
      <Container className="py-20 px-3">
        <div className="space-y-20">
          <ValentineForm session={session!} />
        </div>
      </Container>
      <Container className="space-y-10 mt-10">
        <h2 className="text-2xl text-center font-PlayfairDisplay">
          Список валентинок
        </h2>
        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="sent">
              Отправленные
            </TabsTrigger>
            <TabsTrigger className="w-full" value="received">
              Полученные
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sent">
            <RealtimeSentValentines
              data={sentValentines || []}
              session={session}
            />
          </TabsContent>
          <TabsContent value="received">
            <RealtimeReceivedValentines
              data={receivedValentines || []}
              session={session}
            />
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
}
