import { PageProps } from "../../../../.next/types/app/page";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Container } from "@/components/ui/container";
import { ValentineCard } from "@/components/valentine_card";
import { GoBack } from "@/components/go_back";

export default async function ValentinePage({ params }: PageProps) {
  const { id } = params;
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: valentine, error } = await supabase
    .from("valentines")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <>
      <Container>
        <div className="space-y-2">
          <GoBack />
          {!!valentine ? (
            <ValentineCard
              data={valentine}
              showMore={false}
              showAnswer={valentine.user_id !== session?.user.id}
            />
          ) : (
            <h1 className="text-2xl text-center font-PlayfairDisplay">
              Валентинка не найдена
            </h1>
          )}
        </div>
      </Container>
    </>
  );
}
