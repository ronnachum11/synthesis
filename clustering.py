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

load_dotenv()

ONE_TIME_RUN = True

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))


class UnionFind:
    def __init__(self, articles_data):
        self.root = {article["id"]: article["id"] for article in articles_data}

    def find(self, x):
        if x == self.root[x]:
            return x
        self.root[x] = self.find(self.root[x])
        return self.root[x]

    def union(self, x, y):
        rootX = self.find(x)
        rootY = self.find(y)
        if rootX != rootY:
            self.root[rootY] = rootX


def get_cluster_articles(cluster_id):
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)

    response = (
        supabase.table("articles").select("*").eq("cluster_id", cluster_id).execute()
    )
    print(list(map(lambda x: x["title"], response.data)))


def get_clusters(articles_data=None):
    # Get all vectors from Pinecone (or local)

    threshold = 0.75

    if ONE_TIME_RUN:
        with open("local_vectors.json") as f:
            articles_data = json.load(f)["vectors"][:1000]
            # article_texts = [article["article_text"] for article in articles_data]
            index = pc.Index("news-articles")

            uf = UnionFind(articles_data)

            for i, article in enumerate(articles_data):
                if i % 100 == 0:
                    print(f"Querying {i}/{len(articles_data)}")
                data = index.query(vector=article["values"], top_k=20)

                # print(data)

                filtered = [
                    match["id"]
                    for match in data["matches"]
                    if match["score"] > threshold
                    and match["id"] != article["id"]
                    and match["id"] in map(lambda x: x["id"], articles_data)
                ]
                for m_id in filtered:
                    # print("Union", article["id"], m_id)
                    uf.union(article["id"], m_id)

            grouped_articles = defaultdict(list)
            for ad in articles_data:
                root = uf.find(ad["id"])
                grouped_articles[root].append(ad["id"])

            mappings = {article["id"]: article for article in articles_data}

            for value in sorted(grouped_articles.values(), key=len, reverse=True):
                print([mappings[val]["title"] for val in value], "\n\n")

            # ---------
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")
            supabase = create_client(url, key)

            for cluster_of_articles in grouped_articles.values():
                row_id = str(uuid.uuid4())
                data, _ = supabase.table("clusters").insert({"id": row_id}).execute()

                for article_id in cluster_of_articles:
                    article = mappings[article_id]
                    supabase.table("articles").insert(
                        {
                            "id": article_id,
                            "cluster_id": row_id,
                            "text": article["text"],
                            "title": article["title"],
                            "authors": article["authors"],
                            "publish_date": datetime.now().isoformat(),
                            "top_image": article["top_image"],
                            "images": (article["images"] or [])[:5],
                            "movies": (article["movies"] or [])[:5],
                            "keywords": article["keywords"],
                            "summary": article["summary"],
                            "publisher": article["brand"],
                        }
                    ).execute()
    # ----------

    else:
        embedder = Embed4All()
        vectors = []

        with pc.Index("news-articles", pool_threads=30) as index:
            for i, row in enumerate(articles_data):
                if i % 10 == 0:
                    print(f"Embedding {i}/{len(articles_data)}", len(row["text"]))

                if "text" not in row or not row["text"]:
                    continue

                new_id = str(uuid.uuid4())
                values = embedder.embed(row["text"])
                vec = {"id": new_id, "values": values}
                row["id"] = new_id
                row["values"] = values

                vectors.append(vec)

                if i % 100 == 0 or i == len(articles_data) - 1:
                    print(f"Upserting {i}/{len(articles_data)}")
                    index.upsert(vectors=vectors)

            # article_texts = [article["article_text"] for article in articles_data]
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")
            supabase = create_client(url, key)
            for i, article in enumerate(articles_data):
                if i % 100 == 0:
                    print(f"Querying {i}/{len(articles_data)}")
                data = index.query(vector=article["values"], top_k=20)

                # print(data)

                filtered = [
                    match["id"]
                    for match in data["matches"]
                    if match["score"] > threshold
                    and match["id"] != article["id"]
                    and match["id"] in map(lambda x: x["id"], articles_data)
                ]

                if len(filtered) == 0:
                    row_id = uuid.uuid4()
                    data, _ = (
                        supabase.table("clusters").insert({"id": row_id}).execute()
                    )
                elif len(filtered) == 1:
                    row_id = (
                        supabase.table("articles")
                        .select("cluster_id")
                        .eq("id", filtered[0])
                        .execute()
                    )
                else:
                    old_cluster_ids = [
                        supabase.table("articles")
                        .select("cluster_id")
                        .eq("id", f)
                        .execute()
                        for f in filtered
                    ]

                supabase.table("articles").insert(
                    {
                        "id": article["id"],
                        "cluster_id": row_id,
                        "text": article["text"],
                        "title": article["title"],
                        "authors": article["authors"],
                        "publish_date": datetime.now().isoformat(),
                        "top_image": article["top_image"],
                        "images": (article["images"] or [])[:5],
                        "movies": (article["movies"] or [])[:5],
                        "keywords": article["keywords"],
                        "summary": article["summary"],
                        "publisher": article["brand"],
                    }
                ).execute()

            grouped_articles = defaultdict(list)
            for ad in articles_data:
                root = uf.find(ad["id"])
                grouped_articles[root].append(ad["id"])

            for cluster_root_id, articles_in_cluster in grouped_articles.items():
                print("Cluster {}: {}".format(cluster_root_id, articles_in_cluster))

            # tfidf_vectorizer = TfidfVectorizer()
            # tfidf_matrix = tfidf_vectorizer.fit_transform(article_texts)

            # cosine_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

            # uf = UnionFind(len(articles_data))

            # # Starting threshold - will increase later
            # threshold = 0.6
            # for i in range(len(articles_data)):
            #     for j in range(i + 1, len(articles_data)):
            #         if cosine_sim_matrix[i, j] > threshold:
            #             uf.union(i, j)

            # grouped_articles = defaultdict(list)
            # for i in range(len(articles_data)):
            #     root = uf.find(i)
            #     grouped_articles[root].append(i)

    # # Compare all pairs of vectors
    # for i in range(len(vectors)):
    #     for j in range(i + 1, len(vectors)):
    #         if pc.similarity("news-articles", vectors[i], vectors[j]) > 0.9:
    #             uf.union(i, j)

    # # Get the clusters
    # clusters = {}
    # for i in range(len(vectors)):
    #     root = uf.find(i)
    #     if root not in clusters:
    #         clusters[root] = []
    #     clusters[root].append(vectors[i])

    # return clusters


if __name__ == "__main__":
    get_clusters()
    # get_cluster_articles("3db1e0a5-c4c4-41bd-ba54-0f455ec54151")
