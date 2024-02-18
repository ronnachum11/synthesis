import { Gist } from "@/components/gist";
import { Synthesis } from "@/components/synthesis";

const gistTest = {
  title: "HuffPost's Commitment to Providing Free High-Quality Journalism",
  summary:
    "This is a summary test. I just want to test this out a bit to see how it looks. I'm not sure if this is the best way to do it, but I'm going to try it out.",
  key_takeaways: [
    "Donald Trump fined $355 million in civil fraud trial",
    "Judge Arthur Engoron presided over the case",
    "Trump ordered to pay total penalties of $454 million in separate case",
    "Strong reactions to the rulings from both Trump's legal team and the attorney general's office",
    "Trump's attorneys plan to appeal the rulings",
  ],
  bias: {
    left: 0.1,
    right: 0.9,
    neutral: 0,
  },
};

const synthesisTest = {
  title: "HuffPost's Commitment to Providing Free High-Quality Journalism",
  synthesized_at: "2021-10-10T00:00:00Z",
  synthesis:
    "At HuffPost, we believe that everyone needs high-quality journalism, but we understand that not everyone can afford to pay for expensive news subscriptions. That is why we are committed to providing deeply reported, carefully fact-checked news that is freely accessible to everyone. Whether you come to HuffPost for updates on the 2024 presidential race, hard-hitting investigations into critical issues facing our country today, or trending stories that make you laugh, we appreciate you. The truth is, news costs money to produce, and we are proud that we have never put our stories behind an expensive paywall. Would you join us to help keep our stories free for all? Your contribution of as little as $2 will go a long way.",
};

export default function ClusterPage({
  currentClusterID,
}: {
  currentClusterID: string;
}) {
  return (
    <div className="flex flex-col justify-center w-full items-center">
      <h1>{currentClusterID}</h1>
      <Gist
        title={gistTest.title}
        summary={gistTest.summary}
        key_takeaways={gistTest.key_takeaways}
        bias={gistTest.bias}
        cluster_id={currentClusterID}
      />
      <Synthesis
        title={synthesisTest.title}
        synthesized_at={synthesisTest.synthesized_at}
        synthesis={synthesisTest.synthesis}
        cluster_id={currentClusterID}
      />
    </div>
  );
}
