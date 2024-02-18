import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  console.log(requestUrl);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  await supabase.auth.signOut();

  revalidatePath("/");

  return NextResponse.json({ success: true });
}
