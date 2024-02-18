import { Input } from "@/components/ui/input";

export async function SearchBar() {
  return (
    <div className="w-5/6 mx-auto">
      <Input placeholder="Search..." />
    </div>
  );
}
