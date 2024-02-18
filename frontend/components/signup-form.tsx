"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { signup } from "@/lib/actions/auth";

interface SignupFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SignupForm({ className, ...props }: SignupFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [accessCode, setAccessCode] = React.useState<string>("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleAccessCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccessCode(event.target.value);
  };

  async function onSubmit() {
    setIsLoading(true);

    try {
      if (accessCode == "SynthesisHacks") {
          console.log("HERE");
          await signup(email, password);
          toast.success("Check your email for a confirmation link!");
      } else {
        toast.error("Invalid access code.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }

    setIsLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Password
          </Label>
          <Input
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="●●●●●●●●"
            type="password"
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect="off"
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Password
          </Label>
          <Input
            id="accessCode"
            value={accessCode}
            onChange={handleAccessCodeChange}
            placeholder="Access Code"
            type="input"
            autoCapitalize="none"
            autoComplete="none"
            autoCorrect="off"
            disabled={isLoading}
          />
        </div>
        <Button disabled={isLoading} onClick={onSubmit}>
          {isLoading ? "Loading..." : "Sign up"}
        </Button>
      </div>
    </div>
  );
}
