"use server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getClusters() {
  // get everything about the clusters
  const supabase = createServerActionClient({ cookies });

  const { data, error } = await supabase
    .from("clusters")
    .select("*")
    .limit(1)
    .single();

  return data;
}
