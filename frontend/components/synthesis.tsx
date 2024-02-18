"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { format } from "date-fns";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function Synthesis() {
  return (
    <article className="container relative max-w-3xl py-6 lg:py-10">
      <div className="flex flex-col space-y-2">
        <div>
          <time
            dateTime={new Date().toISOString()}
            className="block text-sm text-muted-foreground"
          >
            Published on {format(new Date(), "MMMM d, yyyy")}
          </time>

          <div className="flex flex-row space-x-4">
            <h1 className="mt-2 inline-block font-semibold text-4xl leading-tight lg:text-5xl">
              Lorem Ipsum
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
          erat volutpat. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Sed sit amet ligula erat. Donec
          et volutpat dui. Proin sit amet hendrerit neque. Mauris quis libero id
          nulla auctor vehicula ut eget nisl. Vivamus tempus sed lectus vel
          laoreet. Nunc a augue eget orci dictum tempus quis non metus. Vivamus
          molestie consequat egestas. Maecenas quis ligula ac urna tempus
          pretium. Praesent sit amet nibh risus. Curabitur aliquam nibh purus,
          vitae porta nibh porttitor sit amet. Vivamus pellentesque commodo ex
          vitae tincidunt. Vivamus erat sapien, egestas ut condimentum sed,
          sagittis feugiat enim. Nam est arcu, dapibus a dui sed, tempor
          placerat nulla.
        </p>
        <p>
          Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus purus
          nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum ultrices
          dolor. In metus felis, facilisis quis enim nec, tristique iaculis
          nibh. Duis egestas lectus ac metus imperdiet consectetur. Etiam congue
          maximus eros, ut tincidunt lacus pharetra non. Mauris interdum in nibh
          et sagittis. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Nulla ut finibus velit, ac
          malesuada lacus. Nulla viverra diam quis consectetur rhoncus. Etiam
          porta, libero et egestas sodales, mauris massa venenatis ex, vel
          rutrum mi lectus non tellus. Praesent vestibulum at sem et facilisis.
          Vestibulum sapien tortor, congue nec sapien nec, tincidunt maximus
          nulla.
        </p>
        <p>
          Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
          erat volutpat. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Sed sit amet ligula erat. Donec
          et volutpat dui. Proin sit amet hendrerit neque. Mauris quis libero id
          nulla auctor vehicula ut eget nisl. Vivamus tempus sed lectus vel
          laoreet. Nunc a augue eget orci dictum tempus quis non metus. Vivamus
          molestie consequat egestas. Maecenas quis ligula ac urna tempus
          pretium. Praesent sit amet nibh risus. Curabitur aliquam nibh purus,
          vitae porta nibh porttitor sit amet. Vivamus pellentesque commodo ex
          vitae tincidunt. Vivamus erat sapien, egestas ut condimentum sed,
          sagittis feugiat enim. Nam est arcu, dapibus a dui sed, tempor
          placerat nulla.
        </p>
        <p>
          Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus purus
          nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum ultrices
          dolor. In metus felis, facilisis quis enim nec, tristique iaculis
          nibh. Duis egestas lectus ac metus imperdiet consectetur. Etiam congue
          maximus eros, ut tincidunt lacus pharetra non. Mauris interdum in nibh
          et sagittis. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Nulla ut finibus velit, ac
          malesuada lacus. Nulla viverra diam quis consectetur rhoncus. Etiam
          porta, libero et egestas sodales, mauris massa venenatis ex, vel
          rutrum mi lectus non tellus. Praesent vestibulum at sem et facilisis.
          Vestibulum sapien tortor, congue nec sapien nec, tincidunt maximus
          nulla.
        </p>
        <p>
          Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
          erat volutpat. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Sed sit amet ligula erat. Donec
          et volutpat dui. Proin sit amet hendrerit neque. Mauris quis libero id
          nulla auctor vehicula ut eget nisl. Vivamus tempus sed lectus vel
          laoreet. Nunc a augue eget orci dictum tempus quis non metus. Vivamus
          molestie consequat egestas. Maecenas quis ligula ac urna tempus
          pretium. Praesent sit amet nibh risus. Curabitur aliquam nibh purus,
          vitae porta nibh porttitor sit amet. Vivamus pellentesque commodo ex
          vitae tincidunt. Vivamus erat sapien, egestas ut condimentum sed,
          sagittis feugiat enim. Nam est arcu, dapibus a dui sed, tempor
          placerat nulla.
        </p>
        <p>
          Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus purus
          nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum ultrices
          dolor. In metus felis, facilisis quis enim nec, tristique iaculis
          nibh. Duis egestas lectus ac metus imperdiet consectetur. Etiam congue
          maximus eros, ut tincidunt lacus pharetra non. Mauris interdum in nibh
          et sagittis. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Nulla ut finibus velit, ac
          malesuada lacus. Nulla viverra diam quis consectetur rhoncus. Etiam
          porta, libero et egestas sodales, mauris massa venenatis ex, vel
          rutrum mi lectus non tellus. Praesent vestibulum at sem et facilisis.
          Vestibulum sapien tortor, congue nec sapien nec, tincidunt maximus
          nulla.
        </p>
        <p>
          Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
          erat volutpat. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Sed sit amet ligula erat. Donec
          et volutpat dui. Proin sit amet hendrerit neque. Mauris quis libero id
          nulla auctor vehicula ut eget nisl. Vivamus tempus sed lectus vel
          laoreet. Nunc a augue eget orci dictum tempus quis non metus. Vivamus
          molestie consequat egestas. Maecenas quis ligula ac urna tempus
          pretium. Praesent sit amet nibh risus. Curabitur aliquam nibh purus,
          vitae porta nibh porttitor sit amet. Vivamus pellentesque commodo ex
          vitae tincidunt. Vivamus erat sapien, egestas ut condimentum sed,
          sagittis feugiat enim. Nam est arcu, dapibus a dui sed, tempor
          placerat nulla.
        </p>
        <p>
          Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus purus
          nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum ultrices
          dolor. In metus felis, facilisis quis enim nec, tristique iaculis
          nibh. Duis egestas lectus ac metus imperdiet consectetur. Etiam congue
          maximus eros, ut tincidunt lacus pharetra non. Mauris interdum in nibh
          et sagittis. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Nulla ut finibus velit, ac
          malesuada lacus. Nulla viverra diam quis consectetur rhoncus. Etiam
          porta, libero et egestas sodales, mauris massa venenatis ex, vel
          rutrum mi lectus non tellus. Praesent vestibulum at sem et facilisis.
          Vestibulum sapien tortor, congue nec sapien nec, tincidunt maximus
          nulla.
        </p>
        <p>
          Pellentesque efficitur tellus sit amet vestibulum eleifend. Aliquam
          erat volutpat. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Sed sit amet ligula erat. Donec
          et volutpat dui. Proin sit amet hendrerit neque. Mauris quis libero id
          nulla auctor vehicula ut eget nisl. Vivamus tempus sed lectus vel
          laoreet. Nunc a augue eget orci dictum tempus quis non metus. Vivamus
          molestie consequat egestas. Maecenas quis ligula ac urna tempus
          pretium. Praesent sit amet nibh risus. Curabitur aliquam nibh purus,
          vitae porta nibh porttitor sit amet. Vivamus pellentesque commodo ex
          vitae tincidunt. Vivamus erat sapien, egestas ut condimentum sed,
          sagittis feugiat enim. Nam est arcu, dapibus a dui sed, tempor
          placerat nulla.
        </p>
        <p>
          Sed eget porta nibh, nec lobortis lectus. Fusce semper faucibus purus
          nec dapibus. Duis elit ipsum, mollis in lorem vel, bibendum ultrices
          dolor. In metus felis, facilisis quis enim nec, tristique iaculis
          nibh. Duis egestas lectus ac metus imperdiet consectetur. Etiam congue
          maximus eros, ut tincidunt lacus pharetra non. Mauris interdum in nibh
          et sagittis. Pellentesque habitant morbi tristique senectus et netus
          et malesuada fames ac turpis egestas. Nulla ut finibus velit, ac
          malesuada lacus. Nulla viverra diam quis consectetur rhoncus. Etiam
          porta, libero et egestas sodales, mauris massa venenatis ex, vel
          rutrum mi lectus non tellus. Praesent vestibulum at sem et facilisis.
          Vestibulum sapien tortor, congue nec sapien nec, tincidunt maximus
          nulla.
        </p>
      </div>
    </article>
  );
}
