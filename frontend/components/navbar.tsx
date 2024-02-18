import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";

export function Navbar() {
  return (
    <div className="flex flex-row w-full items-center space-x-2 p-4 border-b">
      <Logo />
      <SearchBar />
    </div>
  );
}
