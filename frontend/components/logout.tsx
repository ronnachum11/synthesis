"use client";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function Logout() {
  async function Logout() {
    await fetch("/logout/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    redirect("/login");
  }
  return (
    <Button variant="outline" onClick={Logout}>
      Logout
    </Button>
  );
}
