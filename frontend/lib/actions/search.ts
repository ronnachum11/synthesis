"use server";

import fetch from 'node-fetch';
import { PineconeClient } from 'pinecone-client';

const apiKey = 'a69bc407-de77-4737-b85a-8905630bb045';
const indexName = 'semantic-search';

const pineconeClient = new PineconeClient({
  apiKey: apiKey,
  baseUrl: 'https://semantic-search-7uh8oyo.svc.gcp-starter.pinecone.io/'
});

export async function globalSearch(query: string) {
  const response = await fetch('https://synthesis-backend-32ccba375538.herokuapp.com/embed_endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: query }),
  });

  const embedding = await response.json();

  const searchResponse: any = await pineconeClient.query({
    vector: embedding,
    topK: 10,
    includeMetadata: true
  });

  const clusters = searchResponse.matches.filter((result: any) => result.score > 0.45).map((result: any) => ({
    cluster_id: result.metadata.cluster_id,
    excerpt: result.metadata.excerpt,
    relevance: result.score
  }));

  console.log(clusters);

  return clusters;
}

export async function withinClusterSearch(query: string, clusterId: string) {
  const response = await fetch('https://synthesis-backend-32ccba375538.herokuapp.com/embed_endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: query }),
  });

  const embedding = await response.json();

  const searchResponse: any = await pineconeClient.query({
    vector: embedding,
    topK: 200,
    includeMetadata: true,
  });

  const clusters = searchResponse.matches.filter((result: any) => result.score > 0.2 && result.metadata.cluster_id == clusterId).map((result: any) => ({
    cluster_id: result.metadata.cluster_id,
    excerpt: result.metadata.excerpt,
    relevance: result.score
  }));

  if(clusters.length > 0) {
    return clusters[0].excerpt;
  }
  else {
    return null;
  }
}