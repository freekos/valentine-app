"use client";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const GoBack = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()}>
      <ArrowLeftIcon className="w-5 h-5" />
    </Button>
  );
};
