"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReactionButtons } from "@/components/reaction-buttons";
import { Synthesis } from "@/components/synthesis";

import { motion, useAnimation } from "framer-motion";

import { naiveRecAlgo } from "@/lib/actions/clusters";

const synthesisTest = {
  title: "HuffPost's Commitment to Providing Free High-Quality Journalism",
  synthesized_at: "2021-10-10T00:00:00Z",
  synthesis:
    "At HuffPost, we believe that everyone needs high-quality journalism, but we understand that not everyone can afford to pay for expensive news subscriptions. That is why we are committed to providing deeply reported, carefully fact-checked news that is freely accessible to everyone. Whether you come to HuffPost for updates on the 2024 presidential race, hard-hitting investigations into critical issues facing our country today, or trending stories that make you laugh, we appreciate you. The truth is, news costs money to produce, and we are proud that we have never put our stories behind an expensive paywall. Would you join us to help keep our stories free for all? Your contribution of as little as $2 will go a long way.",
};

export function Gist() {
  const [arrOfGists, setArrOfGists] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start as loading

  const controls = useAnimation();
  const [direction, setDirection] = useState(0);

  async function fetchInitialGists() {
    try {
      const res = await naiveRecAlgo("abcd", {}, 5);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchNextGist() {
    try {
      const res = await naiveRecAlgo("abcd", {}, 1);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const res = fetchInitialGists().then((res) => {
      setArrOfGists(res);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey) {
        if (event.key === "j") {
          // Slide left for J
          setDirection(-1);
          controls.start({ x: "-100vw", opacity: 0 }).then(() => {
            // Simulate loading the next Gist by resetting position without animation
            controls.set({ x: "100vw" });
            // Then slide in from the right
            controls.start({ x: 0, opacity: 1 });
          });
        } else if (event.key === "k") {
          // Slide right for K
          setDirection(1);
          controls.start({ x: "100vw", opacity: 0 }).then(() => {
            // Simulate loading the next Gist by resetting position without animation
            controls.set({ x: "-100vw" });
            // Then slide in from the left
            controls.start({ x: 0, opacity: 1 });
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [controls]);

  const currGistData = arrOfGists[0];

  if (!currGistData) return <div>Loading...</div>;

  return (
    <>
      <motion.div
        initial={{ x: 0, opacity: 1 }}
        animate={controls}
        transition={{ type: "tween" }}
        className="container relative max-w-3xl py-6 lg:py-10"
      >
        <div className={`card-animation-container`}>
          <Card className="max-w-2xl overflow-hidden m-4">
            <CardHeader className="flex flex-col gap-1 m-0 pb-4 bg-slate-50">
              <CardTitle className="text-3xl font-bold">
                {currGistData.title ? currGistData.title : "Untitled"}
              </CardTitle>
              <div className="flex flex-row space-between items-end">
                <CardDescription className="leading-relaxed">
                  {currGistData.summary
                    ? currGistData.summary
                    : "No summary available"}
                </CardDescription>
                <ReactionButtons />
              </div>
            </CardHeader>
            <Separator className="mb-4" />
            <CardContent className="flex flex-col space-y-6">
              <div>
                <h2 className="font-semibold text-xl mb-4 mt-2">Takeaways</h2>
                <ul className="list-disc ml-8 text-sm space-y-2">
                  {currGistData.key_takeaways?.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pb-0 px-0 -mx-2">
              {/* Dynamic component like CategoryBar could be re-enabled here */}
            </CardFooter>
          </Card>
        </div>
      </motion.div>
      <Synthesis
        title={synthesisTest.title}
        synthesized_at={synthesisTest.synthesized_at}
        synthesis={synthesisTest.synthesis}
      />
    </>
  );
}