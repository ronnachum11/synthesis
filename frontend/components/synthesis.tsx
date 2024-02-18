"use client";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { ReactionButtons } from "@/components/reaction-buttons";
// NOTES: I deleted the complexity slider component. Decided it was better to implement in-line here.
interface SynthesisProps {
  title: string;
  synthesized_at: string;
  synthesis: string;
  cluster_id: string;
}

export function Synthesis({
  title,
  synthesized_at,
  synthesis,
  cluster_id,
}: SynthesisProps) {
  return (
    <article className="container relative max-w-3xl py-6 lg:py-10">
      <div className="flex flex-col space-y-2">
        <div>
          <time
            dateTime={new Date().toISOString()}
            className="block text-sm text-muted-foreground"
          >
            Synthesized at {format(new Date(synthesized_at), "PPpp")}
          </time>
          <div className="flex flex-row space-x-4">
            <h1 className="mt-2 inline-block font-semibold text-4xl leading-tight lg:text-5xl">
              {title}
            </h1>
          </div>
        </div>
        <ReactionButtons />
      </div>
      {/* <hr className="my-4" /> */}
      <Slider className="my-4" defaultValue={[5]} max={10} min={1} />
      <div className="flex flex-col space-y-4">
        {synthesis.split("\n").map((paragraph, i) => (
          <p key={i} className="text-lg leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
