"use client";
import { Button } from "@/components/ui/button";

export default function Logout() {
  async function Logout() {
    await fetch("/logout/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return (
    <Button variant="outline" onClick={Logout}>
      Logout
    </Button>
  );
}
