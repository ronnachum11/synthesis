"use server";

export async function naiveRecAlgo(
  userId: string,
  currentClusters: any,
  n: number
) {
  // make an array of n clusters: { cluster: string, title: string, summary: string}
  var arr = [];
  for (var i = 0; i < n; i++) {
    arr.push({
      cluster: i.toString(),
      title: `title${i}`,
      summary: `summary${i}`,
    });
  }

  return arr;
}

export async function getClusterById(id: string) {
  return { cluster: id };
}

export async function likeCluster(id: string) {
  return { liked: true };
}

export async function dislikeCluster(id: string) {
  return { disliked: true };
}

export async function viewCluster(id: string) {
  return { viewed: true };
}

export async function readCluster(id: string) {
  return { read: true };
}

export async function calculateBiasScores(id: string) {
  return { left: 0.5, right: 0.4, neutral: 0.1 };
}
