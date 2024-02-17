from pinecone import Pinecone
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import json
from collections import defaultdict
from supabase import create_client, Client
import uuid
from datetime import datetime
from gpt4all import Embed4All

import logging
logging.getLogger("supabase").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

load_dotenv()

ONE_TIME_RUN = True

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def get_all_cluster_ids():
    response = supabase.table("clusters").select("id").execute()
    cluster_ids = [item['id'] for item in response.data]
    # print(cluster_ids)
    return cluster_ids

def get_cluster_articles(cluster_id):
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)

    response = (
        supabase.table("articles").select("*").eq("cluster_id", cluster_id).execute()
    )
    # Assuming response.data is the list of articles you want
    return response.data

def get_all_articles_by_cluster():
    cluster_ids = get_all_cluster_ids()
    full_dict = {}
    for cluster_id in cluster_ids[:50]:
        print(cluster_id)
        full_dict[cluster_id] = get_cluster_articles(cluster_id)
    return full_dict

def keyword_frequency_in_clusters(articles):
    keyword_frequency_dict = defaultdict(int)
    for article in articles:
        for keyword in article['keywords']:
            keyword_frequency_dict[keyword] += 1

    frequent_keywords = {k: v for k, v in keyword_frequency_dict.items() if v >= 2}
    return frequent_keywords

if __name__ == "__main__":
    get_cluster_articles("3db1e0a5-c4c4-41bd-ba54-0f455ec54151")
    articles_by_cluster = get_all_articles_by_cluster()
    for cluster_id, articles in sorted(articles_by_cluster.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"Cluster ID: {cluster_id} - Total Articles: {len(articles)}")
        for article in articles:
            print(article["title"])
        print("\n")

        frequent_keywords_across_clusters = keyword_frequency_in_clusters(articles)
        # print("Frequent Keywords in Clusters:", frequent_keywords_across_clusters)

    print("Total number of clusters:", len(articles_by_cluster))
    print("Total number of articles:", sum(len(articles) for articles in articles_by_cluster.values()))