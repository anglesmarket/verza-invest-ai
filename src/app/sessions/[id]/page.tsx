"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import InSession from "@/components/InSession";

export default function SessionPage() {
  const { id } = useParams();
  const { joinSession, currentSession } = useData();
  const router = useRouter();

  useEffect(() => {
    if (id && currentSession !== id) {
      joinSession(id as string);
    }
  }, [id, currentSession, joinSession]);

  return (
    <main>
      <InSession />
    </main>
  );
}
