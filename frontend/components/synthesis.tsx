"use client";
import { Slider } from "@/components/ui/slider";
import { ReactionButtons } from "@/components/reaction-buttons";
import { motion, useAnimation } from "framer-motion";
import { getSynthesisByComplexity } from "@/lib/actions/synthesis";
import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

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
  const [highlightedText, setHighlightedText] = useState("");
  const [activeHighlight, setActiveHighlight] = useState(true);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    setMessages,
  } = useChat({
    body: {
      synthesis,
    },
  });

  const [hideButtons, setHideButtons] = useState(false);
  const [showTextbox, setShowTextbox] = useState(false);

  const handleTextHighlight = () => {
    const text = window.getSelection().toString();
    setHighlightedText(text);
    setActiveHighlight(false);
  };

  const formatDate = (timestamp) => {
    try {
      return format(parseISO(timestamp), "h:mm a 'PST on' MM/dd/yy");
    } catch (error) {
      console.error("Invalid date format", error);
      return "Invalid date";
    }
  };

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

  const [forceCheck, setForceCheck] = useState(false); // Step 1: New state to trigger re-render

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceCheck(prev => !prev); // Toggle the state to force re-check
    }, 1000); // Adjust the time as needed, here it's 5000ms (5 seconds)

    return () => clearTimeout(timer); // Cleanup to avoid memory leaks
  }, [forceCheck, modifiedSynth, sliderValue]); // Depend on forceCheck to re-run this effect


  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={controls}
      className="flex flex-row container relative max-w-6xl py-6 lg:py-10"
    >
      <article className="container relative max-w-3xl py-6 lg:py-10">
        <div className="flex flex-col space-y-2 mb-4">
          <div>
            <time
              dateTime={new Date().toISOString()}
              className="block text-sm text-muted-foreground"
            >
              Synthesized at {formatDate(synthesized_at)}
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

        <div
          className="flex flex-col space-y-4"
          onMouseUp={handleTextHighlight}
        >
          {modifiedSynth[sliderValue] && modifiedSynth[sliderValue] != "..." ? (
            modifiedSynth[sliderValue].split("\n").map((paragraph, i) => (
              <p key={i} className="text-lg leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="/synthesis.png"
                alt="Loading..."
                className="animate-spin"
                style={{ height: "8vh", marginBottom: "2vh" }}
              />
              <p>Synthesizing alternate reading forms...</p>
            </div>
          )}
        </div>
      </article>
      {highlightedText && (
        <div className="max-w-64 flex flex-col space-y-4">
          <div>
            <X
              onClick={() => {
                setActiveHighlight(!activeHighlight);
                setHighlightedText("");
                setMessages([]);
                setShowTextbox(false);
                setHideButtons(false);
              }}
            />
            <div className="flex flex-col space-y-2">
              <blockquote className="mt-2 border-l-2 pl-6 italic">
                {highlightedText}
              </blockquote>
              {messages.map((m, i) => (
                <blockquote key={i} className="mr-2 border-r-2 pr-6 italic">
                  {m.role === "user" ? "" : m.content}
                </blockquote>
              ))}
            </div>
          </div>

          {/* <div>
            <X
              onClick={() => {
                setActiveHighlight(!activeHighlight);
                setHighlightedText("");
              }}
            />
            <blockquote className="mt-2 border-l-2 pl-6 italic">
              {highlightedText}
            </blockquote>
          </div> */}
          <div
            className={cn(
              "flex flex-col space-y-2",
              hideButtons ? "hidden" : ""
            )}
          >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <Button
                onClick={() => {
                  setInput("Explain this to me! I don't understand.");
                }}
                type="submit"
              >
                Explain this further
              </Button>
              <Button
                onClick={() => {
                  setShowTextbox(true);
                  setHideButtons(true);
                }}
              >
                Ask a question
              </Button>
            </form>
          </div>
          <div
            className={cn(
              "flex flex-col space-y-2",
              !showTextbox ? "hidden" : ""
            )}
          >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <Textarea value={input} onChange={handleInputChange} />
              <Button className="w-full" type="submit">
                <Send />
              </Button>
            </form>
          </div>
          {/* <div className="flex flex-row">
            <Textarea />
            <Button size="icon">
              <Send />
            </Button>
          </div> */}
        </div>
      )}
    </motion.div>
  );
}
