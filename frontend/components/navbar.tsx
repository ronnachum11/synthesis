import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";
import Logout from "./logout";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Button } from "./ui/button";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export async function Navbar() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const user = await supabase.auth.getUser();
  console.log(user);

  if (!user.data.user) {
    return (
      <div className="flex flex-row w-full items-center space-x-2 p-4 border-b">
        <Logo />
        <SearchBar />
        <ModeToggle />
        <Button variant="default" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-row w-full items-center space-x-2 p-4 border-b">
      <Logo />
      <SearchBar />
      <ModeToggle />
      <Logout />
    </div>
  );
}
