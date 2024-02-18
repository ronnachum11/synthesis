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

import { naiveRecAlgo } from "@/lib/actions/clusters";

export function Gist() {
  const [arrOfGists, setArrOfGists] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [exitAnimation, setExitAnimation] = useState("");
  const [enterAnimation, setEnterAnimation] = useState("");

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
    const handleKeyDown = async (event) => {
      if (
        !isLoading &&
        event.metaKey &&
        (event.key === "j" || event.key === "k")
      ) {
        setIsLoading(true);
        setExitAnimation(
          event.key === "j" ? "slide-out-left" : "slide-out-right"
        );
        setEnterAnimation(
          event.key === "j" ? "slide-in-right" : "slide-in-left"
        );

        setTimeout(async () => {
          const nextGistArray = await fetchNextGist(); // This will be an array
          const nextGist = nextGistArray[0]; // Access the first (and only) gist
          if (nextGist) {
            // Update the array of gists by adding the new gist to the end
            setArrOfGists((prevGists) => [...prevGists.slice(1), nextGist]);
          }

          setIsLoading(false);
          setExitAnimation("");
          setTimeout(() => {
            setEnterAnimation("");
          }, 400); // Reset enter animation after it finishes
        }, 400); // Match the duration of the exit animation
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, arrOfGists]);

  const currGistData = arrOfGists[0];

  if (!currGistData) return <div>Loading...</div>;

  return (
    <div className={`card-animation-container ${exitAnimation}`}>
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
  );
}
