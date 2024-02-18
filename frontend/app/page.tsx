import NavButtons from "@/components/nav-buttons";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen min-w-screen justify-center items-center">
      <h1>Home page</h1>
      <NavButtons />
    </main>
  );
}
