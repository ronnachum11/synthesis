"use client";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

export default function Logout() {
  async function Logout() {
    console.log("LOGOUT");
    await logout();
  }
  return (
    <Button variant="outline" onClick={Logout}>
      Logout
    </Button>
  );
}
