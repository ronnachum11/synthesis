import { globalSearch } from "../lib/actions/search";

export default function Home() {
  console.log(globalSearch("Donald Trump Joe Biden"));

  return (
    <main className="w-full min-h-screen flex flex-col justify-center">
      <h1>Hello, World!</h1>
    </main>
  );
}
