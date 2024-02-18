"use server";

export async function globalSearch() {
  return [{ cluster: "cluster1" }, { cluster: "cluster2" }];
}

export async function withinClusterSearch() {
  return "This is the quote within the cluster that answers what you're looking for.";
}
