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

import {
  naiveRecAlgo,
  likeCluster,
  dislikeCluster,
  viewCluster,
  readCluster,
  getClusterById
} from "@/lib/actions/clusters";

// const synthesisTest = {
//   title: "HuffPost's Commitment to Providing Free High-Quality Journalism",
//   synthesized_at: "2021-10-10T00:00:00Z",
//   synthesis:
//     "At HuffPost, we believe that everyone needs high-quality journalism, but we understand that not everyone can afford to pay for expensive news subscriptions. That is why we are committed to providing deeply reported, carefully fact-checked news that is freely accessible to everyone. Whether you come to HuffPost for updates on the 2024 presidential race, hard-hitting investigations into critical issues facing our country today, or trending stories that make you laugh, we appreciate you. The truth is, news costs money to produce, and we are proud that we have never put our stories behind an expensive paywall. Would you join us to help keep our stories free for all? Your contribution of as little as $2 will go a long way.",
// };

export function Gist({ currentClusterID }: { currentClusterID: string }) {
  const [arrOfGists, setArrOfGists] = useState([]);
  const [currentCluster, setCurrentCluster] = useState({});
  const [nextClusters, setNextClusters] = useState<{}[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [viewLoaded, setViewLoaded] = useState(false);

  const controls = useAnimation();
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchCluster = async () => {
      const cluster = await getClusterById(currentClusterID);
      setCurrentCluster(cluster);
    };

    fetchCluster();
  }, []);

  useEffect(() => {
    const fetchNextClusters = async () => {
      const clusters = await naiveRecAlgo([], 5);
      setNextClusters(clusters);
      setViewLoaded(true);
    };

    fetchNextClusters();
  }, []);

  useEffect(() => {
    console.log("cluster", currentCluster);
  }, [currentCluster]);

  useEffect(() => {
    console.log("nextClusters", nextClusters);
  }, [nextClusters]);


  function nextGist() {
    setNextClusters((prevNextClusters) => {
      if (prevNextClusters.length > 0) {
        // Move the first cluster to the end of the array to cycle through the existing clusters
        const firstCluster = prevNextClusters[0];
        const updatedNextClusters = [...prevNextClusters.slice(1), firstCluster];
        
        // Update the current cluster to the first cluster of the previous state
        setCurrentCluster(firstCluster);
        
        return updatedNextClusters;
      } else {
        console.log("Cycling back to the initial clusters");
        // If there are no next clusters, you might want to fetch new ones or handle this case differently
        return prevNextClusters;
      }
    });
  }

  async function fetchInitialGists() {
    try {
      const res = await naiveRecAlgo([], 5);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchNextGist() {
    try {
      const res = await naiveRecAlgo([], 1);
      // console.log("fetchNextGist", res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    viewCluster(currentClusterID);

    const runGetGists = fetchInitialGists().then((res) => {
      // console.log(res);
      setArrOfGists(res);
      setIsLoading(false);
    });
  }, [currentClusterID]);

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
            likeCluster(currentClusterID);
            // remove the current gist from the arrOfGists, and then request a new one with fetchNextGist to add to the arrOfGists
            // setArrOfGists((old) => old.slice(1));
            // fetchNextGist().then((res) => {
            //   setArrOfGists((old) => [...old, res]);
            // });
            nextGist();
          });
        } else if (event.key === "k") {
          // Slide right for K
          setDirection(1);
          controls.start({ x: "100vw", opacity: 0 }).then(() => {
            // Simulate loading the next Gist by resetting position without animation
            controls.set({ x: "-100vw" });
            // Then slide in from the left
            controls.start({ x: 0, opacity: 1 });
            dislikeCluster(currentClusterID);
            nextGist();
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [controls]);

  console.log(currentCluster, "currentCluster")
  if (Object.keys(currentCluster).length === 0)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: " 100vh",
        }}
      >
        <img
          src="/synthesis.png"
          alt="Loading..."
          className="animate-spin"
          style={{ height: "8vh", marginBottom: "2vh" }}
        />
        <p>Loading the gists...</p>
      </div>
    );

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
                {currentCluster.title ? currentCluster.title : "Untitled"}
              </CardTitle>
              <div className="flex flex-row space-between items-end">
                <CardDescription className="leading-relaxed">
                  {currentCluster.summary
                    ? currentCluster.summary
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
                  {currentCluster.key_takeaways?.map((takeaway, i) => (
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
        title={currentCluster.title}
        synthesized_at={currentCluster.created_at}
        synthesis={currentCluster.synthesis}
      />
    </>
  );
}
