"use client";
import { format, set } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { ReactionButtons } from "@/components/reaction-buttons";
import { motion, useAnimation } from "framer-motion";
import { use, useEffect, useRef, useState } from "react";
import { getSynthesisByComplexity } from "@/lib/actions/synthesis";

// NOTES: I deleted the complexity slider component. Decided it was better to implement in-line here.
interface SynthesisProps {
  title: string;
  synthesized_at: string;
  synthesis: string;
}

interface ModifiedSynthProps {
  content: {
    easy: string;
    concise: string;
    normal: string;
    detailed: string;
  };
}

export function Synthesis({
  title,
  synthesized_at,
  synthesis,
}: SynthesisProps) {
  const controls = useAnimation();
  const [modifiedSynth, setModifiedSynth] = useState([
    "...",
    "...",
    synthesis,
    "...",
  ]);
  const [sliderValue, setSliderValue] = useState(2);

  // useEffect(() => {
  //   setModifiedSynth({
  //     easy: "...",
  //     concise: "...",
  //     normal: synthesis,
  //     detailed: "...",
  //   });
  // }, [synthesis]);

  useEffect(() => {
    console.log("sliderValue", sliderValue);
    async function setMod() {
      const { text } = await getSynthesisByComplexity(
        "clusterId",
        sliderValue,
        synthesis,
        modifiedSynth[sliderValue]
      );
      setModifiedSynth((old) => {
        return old.map((value, index) => {
          if (index === sliderValue) {
            return text;
          }
          return value;
        });
      });
    }
    setMod();
  }, [sliderValue]);

  const mp = ["Concise", "Easy", "Normal", "Detailed"];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if either Command + J or Command + K is pressed
      if ((event.key === "j" || event.key === "k") && event.metaKey) {
        // Trigger the animation to move off the screen
        controls.start({ y: 1000, opacity: 0 });

        // Here, you would also handle the logic to bring in the new Gist
        // For example, you might set a timeout to reset the animation after a delay
        setTimeout(() => {
          controls.start({ y: 0, opacity: 1 });
        }, 1000); // Adjust the delay as needed
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [controls]);
  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={controls}
      className="container relative max-w-3xl py-6 lg:py-10"
    >
      <article className="container relative max-w-3xl py-6 lg:py-10">
        <div className="flex flex-col space-y-2 mb-4">
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
          <div className="flex flex-row gap-4 items-center">
            <div className="flex flex-row gap-2 items-center">
              <Slider
                className="my-4 w-48"
                defaultValue={[sliderValue + 1]}
                max={4}
                min={1}
                onValueChange={(e) => setSliderValue(e - 1)}
              />
              <div>{mp[sliderValue]}</div>
            </div>
            <ReactionButtons />
          </div>
        </div>
        {/* <hr className="my-4" /> */}

        <div className="flex flex-col space-y-4">
          {modifiedSynth[sliderValue].split("\n").map((paragraph, i) => (
            <p key={i} className="text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </motion.div>
  );
}
