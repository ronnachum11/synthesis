"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

export async function naiveRecAlgo(userId: string, currentClusters: any[], n: number) {
  // Retrieve the user's viewed clusters
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('views')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error("User not found or error fetching user data");
    return [];
  }

  const viewedClusters = userData.views || [];

  // Query for clusters not viewed by the user and not in the currentClusters list
  const { data: clustersData, error: clustersError } = await supabase
    .from('clusters')
    .select('*, cardinality(article_ids) as article_count') // Use cardinality to get the length of article_ids array
    .not('id', 'in', `(${viewedClusters.join(',')})`) // Exclude clusters the user has viewed
    .not('id', 'in', `(${currentClusters.map(cluster => cluster.id).join(',')})`) // Exclude clusters already in currentClusters
    .order('article_count', { ascending: false }) // Order by the length of article_ids
    .limit(n);

  if (clustersError) {
    console.error("Error fetching clusters");
    return [];
  }

  return clustersData;
}

// const { data, error } = await supabase.auth.getUser();
// if (error || !data?.user) {
//   redirect("/");
// }

// return <p>Hello {data.user.email}</p>;

export async function getClusterById(id: string) {
  const { data, error } = await supabase
  .from('clusters')
  .select('*')
  .eq('id', id)
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
    .from('profiles')
    .select(columnName)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Check if the id already exists in the array to prevent duplicates
  if (!data[columnName].includes(id)) {
    const updatedArray = [...data[columnName], id];
    const { error: updateError } = await supabase
      .from('users')
      .update({ [columnName]: updatedArray })
      .eq('id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return { [columnName]: true };
}

export async function likeCluster(id: string) {
  return updateUserArrayColumn('likes', id);
}

export async function dislikeCluster(id: string) {
  return updateUserArrayColumn('dislikes', id);
}

export async function viewCluster(id: string) {
  return updateUserArrayColumn('views', id);
}

export async function readCluster(id: string) {
  return updateUserArrayColumn('reads', id);
}

export async function calculateBiasScores(id: string) {
  return { left: 0.5, right: 0.4, neutral: 0.1 };
}
