import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import Link from "next/link";

import Logout from "@/components/logout";

export default async function NavButtons() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(user);

  return (
    <>
      {user ? (
        <div className="z-10 absolute right-4 top-4 flex space-x-4 md:right-8 md:top-8">
          <Button variant="default" asChild>
            <Link href="/dashboard" className="">
              Dashboard
            </Link>
          </Button>
          <Logout />
        </div>
      ) : (
        <Button variant="ghost" asChild>
          <Link
            href="/login"
            className="z-10 absolute right-4 top-4 md:right-8 md:top-8"
          >
            Login
          </Link>
        </Button>
      )}
    </>
  );
}
