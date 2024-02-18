"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { globalSearch } from "@/lib/actions/search";
import { getClusterById } from "@/lib/actions/clusters";
import Link from "next/link";
export default function SearchResults() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function performSearch(query: string) {
      const res = await globalSearch(query);
      return res;
    }
    const res = performSearch(String(searchParams.get("query")));
    // map through res and then get the cluster by id, but still keep all the other data
    res.then((data) => {
      const clusterIds = data.map((result: any) => result.cluster_id);
      const clusters = clusterIds.map((id: string) => getClusterById(id));

      Promise.all(clusters).then((clusterData) => {
        const results = data.map((result: any, index: number) => {
          return {
            ...result,
            title: clusterData[index].title,
            cluster_id: clusterData[index].id,
          };
        });
        setSearchResults(results);
        setLoading(false);
      });
    });
  }, [searchParams]);

  return (
    <div className="w-screen flex flex-col justify-center items-center">
      {loading ? (
        <div
          className="mt-20"
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
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {searchResults.map((result: any) => {
            return (
              <Link key={result.id} href={`/news/${result.cluster_id}`}>
                <Card className="bg-white rounded-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {result.title}
                    </h2>
                    <p className="text-gray-700">{result.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
