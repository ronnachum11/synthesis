import Link from "next/link";

export function Logo() {
  return (
    <div className="w-64">
      <Link
        className="relative z-20 flex items-center text-lg font-medium"
        href="/"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-6 w-6"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        Synthesis
      </Link>
    </div>
  );
}
