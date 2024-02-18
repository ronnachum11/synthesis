"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

export async function naiveRecAlgo(currentClusters: any[], n: number) {
  // Retrieve the user's id
  const { data: userdat, error: usererr } = await supabase.auth.getUser();
  // Retrieve the user's viewed clusters
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("views")
    .eq("id", userdat?.user?.id)
    .single();

  console.log(usererr, userData);

  if (userError != null) {
    console.error("User not found or error fetching user data");
    return [];
  }

  // const viewedClusters = userData.views || [];

  // // Query for clusters not viewed by the user and not in the currentClusters list
  // const { data: clustersData, error: clustersError } = await supabase
  //   .from("clusters")
  //   .select("*, cardinality(article_ids) as article_count") // Use cardinality to get the length of article_ids array
  //   .not("id", "in", `(${viewedClusters.join(",")})`) // Exclude clusters the user has viewed
  //   .not(
  //     "id",
  //     "in",
  //     `(${
  //       currentClusters.length > 0
  //         ? currentClusters.map((cluster) => cluster.id).join(",")
  //         : ""
  //     })`
  //   ) // Exclude clusters already in currentClusters
  //   .order("article_count", { ascending: false }) // Order by the length of article_ids
  //   .limit(n);

  // if (clustersError) {
  //   console.error(clustersError);
  //   return [];
  // }

  // return clustersData;
  const viewedClusters = userData.views || [];

  // Query for clusters not viewed by the user and not in the currentClusters list
  const { data: clustersData, error: clustersError } = await supabase
    .from("clusters")
    .select("*") // Removed cardinality operation
    .not("id", "in", `(${viewedClusters.join(",")})`) // Exclude clusters the user has viewed
    .not(
      "id",
      "in",
      `(${
        currentClusters.length > 0
          ? currentClusters.map((cluster) => cluster.id).join(",")
          : ""
      })`
    ) // Exclude clusters already in currentClusters
    .limit(n);

  if (clustersError) {
    console.error(clustersError);
    return [];
  }

  // Assuming article_ids is an array, calculate article_count here
  const enhancedClustersData = clustersData
    .map((cluster) => ({
      ...cluster,
      article_count: cluster.article_ids ? cluster.article_ids.length : 0,
    }))
    .sort((a, b) => b.article_count - a.article_count); // Sort by article_count descending

  return enhancedClustersData;
}

// export async function naiveRecAlgo(
//   userId: string,
//   currentClusters: any,
//   n: number
// ) {
//   // make an array of n clusters: { cluster: string, title: string, summary: string}
//   var arr = [];
//   for (var i = 0; i < n; i++) {
//     arr.push({
//       cluster: i.toString(),
//       title: `title${i}`,
//       summary: `summary${i}`,
//     });
//   }

//   return arr;
// }

// const { data, error } = await supabase.auth.getUser();
// if (error || !data?.user) {
//   redirect("/");
// }

// return <p>Hello {data.user.email}</p>;

export async function getClusterById(id: string) {
  const { data, error } = await supabase
    .from("clusters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function updateUserArrayColumn(columnName: string, id: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.log("User not found");
    return { [columnName]: false };
  }
  const userId = userData.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select(columnName)
    .eq("id", userId)
    .single();
  console.log("DATA", data);
  if (error) {
    throw new Error(error.message);
  }
  console.log("ID", id);
  // Check if the id already exists in the array to prevent duplicates
  if (data[columnName] == null) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [columnName]: [id] })
      .eq("id", userId);

    console.log("updateError", updateError);
    if (updateError) {
      throw new Error(updateError.message);
    }
  } else if (!data[columnName].includes(id)) {
    const updatedArray = [...data[columnName], id];
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [columnName]: updatedArray })
      .eq("id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return { [columnName]: true };
}

export async function likeCluster(id: string) {
  return updateUserArrayColumn("likes", id);
}

export async function dislikeCluster(id: string) {
  return updateUserArrayColumn("dislikes", id);
}

export async function viewCluster(id: string) {
  return updateUserArrayColumn("views", id);
}

export async function readCluster(id: string) {
  return updateUserArrayColumn("reads", id);
}

export async function calculateBiasScores(id: string) {
  return { left: 0.5, right: 0.4, neutral: 0.1 };
}
