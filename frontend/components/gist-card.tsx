import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CategoryBar } from "@tremor/react";
import { Button } from "./ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export function GistCard() {
  return (
    <Card className="max-w-lg overflow-hidden">
      <CardHeader className="flex flex-col gap-1 m-0 pb-4 bg-slate-50">
        <div className="flex flex-row space-between items-center">
          <CardTitle className="text-3xl font-bold">Lorem Ipsum</CardTitle>
          <div className="flex flex-row space-x-2 ml-auto">
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
        <CardDescription className="leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed placerat
          lacus eu vehicula placerat. In non lorem consequat augue blandit
          imperdiet. Morbi ut viverra lacus. Morbi sodales ligula et mi
          tristique iaculis.
        </CardDescription>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex flex-col space-y-6">
        <div>
          <h2 className="font-semibold text-xl mb-4 mt-2">Takeaways</h2>
          <ul className="list-disc ml-8 text-sm space-y-2">
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
          </ul>
        </div>
        {/* <div>
          <h2 className="font-semibold mb-4 text-xl">Major Actors</h2>
          <ul className="text-sm flex flex-col space-y-4">
            <li className="flex flex-row space-x-2 items-center">
              <Avatar>
                <AvatarImage src="https://assets.editorial.aetnd.com/uploads/2016/11/donald-trump-gettyimages-687193180.jpg" />
                <AvatarFallback>DT</AvatarFallback>
              </Avatar>
              <p className="font-medium">Donald Trump</p>
            </li>
            <li className="flex flex-row space-x-2 items-center">
              <Avatar>
                <AvatarImage src="https://image.cnbcfm.com/api/v1/image/106878527-1620223837055-106748412-1602881184740-biden.jpg" />
                <AvatarFallback>JB</AvatarFallback>
              </Avatar>
              <p className="font-medium">Joe Biden</p>
            </li>
            <li className="flex flex-row space-x-2 items-center">
              <Avatar>
                <AvatarImage src="https://www.whitehouse.gov/wp-content/uploads/2021/04/V20210305LJ-0043.jpg" />
                <AvatarFallback>KH</AvatarFallback>
              </Avatar>
              <p className="font-medium">Kamala Harris</p>
            </li>
          </ul>
        </div> */}
      </CardContent>
      <CardFooter className="pb-0 px-0 -mx-2">
        <CategoryBar
          values={[70, 5, 25]}
          colors={["blue", "gray", "red"]}
          showLabels={false}
          className="w-full rounded-none"
        />
      </CardFooter>
    </Card>
  );
}
