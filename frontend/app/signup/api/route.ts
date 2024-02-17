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

  const data = await supabase.auth.signUp({
    email,
    password,
  });

  console.log(data);

  return NextResponse.redirect(new URL("/", request.url), {
    status: 301,
  });
}
