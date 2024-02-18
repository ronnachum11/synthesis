import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  const formData = await request.json();
  const email = String(formData.email);
  const password = String(formData.password);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: "Invalid email or password" });
  }

  return NextResponse.json({ success: true });
}
