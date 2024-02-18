import { Gist } from "@/components/gist";
import { Synthesis } from "@/components/synthesis";

export default function ClusterPage({
  params,
}: {
  params: { currentClusterID: string };
}) {
  return (
    <div className="flex flex-col justify-center w-full items-center">
      <Gist currentClusterID={params.currentClusterID} />
    </div>
  );
}
