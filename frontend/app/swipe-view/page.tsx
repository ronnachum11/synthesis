"use client";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";
// import { Article } from "@/components/article";
import { Gist } from "@/components/gist";
import { DisplayGraph } from "@/components/graph-test";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { formatDate } from "date-fns";
import React, { useState, useEffect, useRef } from "react";
import { getClusters } from "@/lib/actions/clusters";

export default function SwipeView() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [cluster, setCluster] = useState(undefined);
  const articleRef = useRef(null);

  useEffect(() => {
    fetchCluster();
    const handleScroll = () => {
      const scrollThreshold = 100;

      if (window.scrollY > scrollThreshold && !hasScrolled) {
        setHasScrolled(true);

        // Calculate article's top position relative to the document
        const articleTop =
          articleRef.current.getBoundingClientRect().top +
          window.scrollY -
          (document.querySelector(".buffer-element").offsetHeight || 0);

        // Explicitly scroll to the article's top position
        window.scrollTo({
          top: articleTop,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  async function fetchCluster() {
    const clusters = await getClusters();
    setCluster(clusters);
  }

  return (
    <div
      className={`flex flex-col h-screen min-w-screen initial-view ${
        hasScrolled ? "scrolled" : ""
      }`}
    >
      <div
        className={`${hasScrolled ? "hidden" : "visible"} buffer-element`}
        style={{ height: "100vh" }}
      ></div>

      <div className="flex flex-row w-full items-center space-x-2 p-4 border-b">
        <Logo />
        <SearchBar />
      </div>
      <div className="h-fit flex justify-center items-center p-12 space-x-8">
        <Gist />
        <div className="w-1/3 h-1/2">
          <DisplayGraph />
          {/* <DisplayTimeline /> */}
        </div>
      </div>
      <article
        ref={articleRef}
        className="container max-w-3xl py-6 lg:py-10 article-fade"
      >
        <div className="flex flex-col space-y-2">
          <div>
            <time
              dateTime={new Date().toISOString()}
              className="block text-sm text-muted-foreground"
            >
              {/* Published on {formatDate(cluster?.created_at, "MMMM d, yyyy")} */}
              Published on {cluster?.created_at}
            </time>

            <div className="flex flex-row space-x-4">
              <h1 className="mt-2 inline-block font-semibold text-4xl leading-tight lg:text-5xl">
                {String(cluster?.title)}
              </h1>
            </div>
          </div>
          <div className="flex flex-row space-x-2">
            <Button variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 mr-2" />
              <p className="text-sm text-muted-foreground">
                <span className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>J
                </span>
              </p>
            </Button>
            <Button variant="outline" size="sm">
              <ThumbsDown className="h-4 w-4 mr-2 bg-" />
              <p className="text-sm text-muted-foreground">
                <span className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </span>
              </p>
            </Button>
          </div>
        </div>
        {/* <hr className="my-4" /> */}
        <Slider className="my-4" defaultValue={[5]} max={10} min={1} />
        <div className="flex flex-col space-y-4">
          <p>
            Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
            erat volutpat. Pellentesque habitant morbi tristique senectus et
            netus et malesuada fames ac turpis egestas. Sed sit amet ligula
            erat. Donec et volutpat dui. Proin sit amet hendrerit neque. Mauris
            quis libero id nulla auctor vehicula ut eget nisl. Vivamus tempus
            sed lectus vel laoreet. Nunc a augue eget orci dictum tempus quis
            non metus. Vivamus molestie consequat egestas. Maecenas quis ligula
            ac urna tempus pretium. Praesent sit amet nibh risus. Curabitur
            aliquam nibh purus, vitae porta nibh porttitor sit amet. Vivamus
            pellentesque commodo ex vitae tincidunt. Vivamus erat sapien,
            egestas ut condimentum sed, sagittis feugiat enim. Nam est arcu,
            dapibus a dui sed, tempor placerat nulla.
          </p>
          <p>
            Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus
            purus nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum
            ultrices dolor. In metus felis, facilisis quis enim nec, tristique
            iaculis nibh. Duis egestas lectus ac metus imperdiet consectetur.
            Etiam congue maximus eros, ut tincidunt lacus pharetra non. Mauris
            interdum in nibh et sagittis. Pellentesque habitant morbi tristique
            senectus et netus et malesuada fames ac turpis egestas. Nulla ut
            finibus velit, ac malesuada lacus. Nulla viverra diam quis
            consectetur rhoncus. Etiam porta, libero et egestas sodales, mauris
            massa venenatis ex, vel rutrum mi lectus non tellus. Praesent
            vestibulum at sem et facilisis. Vestibulum sapien tortor, congue nec
            sapien nec, tincidunt maximus nulla.
          </p>
          <p>
            Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
            erat volutpat. Pellentesque habitant morbi tristique senectus et
            netus et malesuada fames ac turpis egestas. Sed sit amet ligula
            erat. Donec et volutpat dui. Proin sit amet hendrerit neque. Mauris
            quis libero id nulla auctor vehicula ut eget nisl. Vivamus tempus
            sed lectus vel laoreet. Nunc a augue eget orci dictum tempus quis
            non metus. Vivamus molestie consequat egestas. Maecenas quis ligula
            ac urna tempus pretium. Praesent sit amet nibh risus. Curabitur
            aliquam nibh purus, vitae porta nibh porttitor sit amet. Vivamus
            pellentesque commodo ex vitae tincidunt. Vivamus erat sapien,
            egestas ut condimentum sed, sagittis feugiat enim. Nam est arcu,
            dapibus a dui sed, tempor placerat nulla.
          </p>
          <p>
            Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus
            purus nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum
            ultrices dolor. In metus felis, facilisis quis enim nec, tristique
            iaculis nibh. Duis egestas lectus ac metus imperdiet consectetur.
            Etiam congue maximus eros, ut tincidunt lacus pharetra non. Mauris
            interdum in nibh et sagittis. Pellentesque habitant morbi tristique
            senectus et netus et malesuada fames ac turpis egestas. Nulla ut
            finibus velit, ac malesuada lacus. Nulla viverra diam quis
            consectetur rhoncus. Etiam porta, libero et egestas sodales, mauris
            massa venenatis ex, vel rutrum mi lectus non tellus. Praesent
            vestibulum at sem et facilisis. Vestibulum sapien tortor, congue nec
            sapien nec, tincidunt maximus nulla.
          </p>
          <p>
            Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
            erat volutpat. Pellentesque habitant morbi tristique senectus et
            netus et malesuada fames ac turpis egestas. Sed sit amet ligula
            erat. Donec et volutpat dui. Proin sit amet hendrerit neque. Mauris
            quis libero id nulla auctor vehicula ut eget nisl. Vivamus tempus
            sed lectus vel laoreet. Nunc a augue eget orci dictum tempus quis
            non metus. Vivamus molestie consequat egestas. Maecenas quis ligula
            ac urna tempus pretium. Praesent sit amet nibh risus. Curabitur
            aliquam nibh purus, vitae porta nibh porttitor sit amet. Vivamus
            pellentesque commodo ex vitae tincidunt. Vivamus erat sapien,
            egestas ut condimentum sed, sagittis feugiat enim. Nam est arcu,
            dapibus a dui sed, tempor placerat nulla.
          </p>
          <p>
            Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus
            purus nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum
            ultrices dolor. In metus felis, facilisis quis enim nec, tristique
            iaculis nibh. Duis egestas lectus ac metus imperdiet consectetur.
            Etiam congue maximus eros, ut tincidunt lacus pharetra non. Mauris
            interdum in nibh et sagittis. Pellentesque habitant morbi tristique
            senectus et netus et malesuada fames ac turpis egestas. Nulla ut
            finibus velit, ac malesuada lacus. Nulla viverra diam quis
            consectetur rhoncus. Etiam porta, libero et egestas sodales, mauris
            massa venenatis ex, vel rutrum mi lectus non tellus. Praesent
            vestibulum at sem et facilisis. Vestibulum sapien tortor, congue nec
            sapien nec, tincidunt maximus nulla.
          </p>
          <p>
            Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
            erat volutpat. Pellentesque habitant morbi tristique senectus et
            netus et malesuada fames ac turpis egestas. Sed sit amet ligula
            erat. Donec et volutpat dui. Proin sit amet hendrerit neque. Mauris
            quis libero id nulla auctor vehicula ut eget nisl. Vivamus tempus
            sed lectus vel laoreet. Nunc a augue eget orci dictum tempus quis
            non metus. Vivamus molestie consequat egestas. Maecenas quis ligula
            ac urna tempus pretium. Praesent sit amet nibh risus. Curabitur
            aliquam nibh purus, vitae porta nibh porttitor sit amet. Vivamus
            pellentesque commodo ex vitae tincidunt. Vivamus erat sapien,
            egestas ut condimentum sed, sagittis feugiat enim. Nam est arcu,
            dapibus a dui sed, tempor placerat nulla.
          </p>
          <p>
            Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus
            purus nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum
            ultrices dolor. In metus felis, facilisis quis enim nec, tristique
            iaculis nibh. Duis egestas lectus ac metus imperdiet consectetur.
            Etiam congue maximus eros, ut tincidunt lacus pharetra non. Mauris
            interdum in nibh et sagittis. Pellentesque habitant morbi tristique
            senectus et netus et malesuada fames ac turpis egestas. Nulla ut
            finibus velit, ac malesuada lacus. Nulla viverra diam quis
            consectetur rhoncus. Etiam porta, libero et egestas sodales, mauris
            massa venenatis ex, vel rutrum mi lectus non tellus. Praesent
            vestibulum at sem et facilisis. Vestibulum sapien tortor, congue nec
            sapien nec, tincidunt maximus nulla.
          </p>
          <p>
            Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
            erat volutpat. Pellentesque habitant morbi tristique senectus et
            netus et malesuada fames ac turpis egestas. Sed sit amet ligula
            erat. Donec et volutpat dui. Proin sit amet hendrerit neque. Mauris
            quis libero id nulla auctor vehicula ut eget nisl. Vivamus tempus
            sed lectus vel laoreet. Nunc a augue eget orci dictum tempus quis
            non metus. Vivamus molestie consequat egestas. Maecenas quis ligula
            ac urna tempus pretium. Praesent sit amet nibh risus. Curabitur
            aliquam nibh purus, vitae porta nibh porttitor sit amet. Vivamus
            pellentesque commodo ex vitae tincidunt. Vivamus erat sapien,
            egestas ut condimentum sed, sagittis feugiat enim. Nam est arcu,
            dapibus a dui sed, tempor placerat nulla.
          </p>
          <p>
            Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus
            purus nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum
            ultrices dolor. In metus felis, facilisis quis enim nec, tristique
            iaculis nibh. Duis egestas lectus ac metus imperdiet consectetur.
            Etiam congue maximus eros, ut tincidunt lacus pharetra non. Mauris
            interdum in nibh et sagittis. Pellentesque habitant morbi tristique
            senectus et netus et malesuada fames ac turpis egestas. Nulla ut
            finibus velit, ac malesuada lacus. Nulla viverra diam quis
            consectetur rhoncus. Etiam porta, libero et egestas sodales, mauris
            massa venenatis ex, vel rutrum mi lectus non tellus. Praesent
            vestibulum at sem et facilisis. Vestibulum sapien tortor, congue nec
            sapien nec, tincidunt maximus nulla.
          </p>
          {/* {String(cluster?.synthesis)} */}
        </div>
      </article>
    </div>
  );
}
