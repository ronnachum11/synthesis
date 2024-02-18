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
import models
import instructor
from pydantic import BaseModel
from openai import OpenAI
import concurrent

load_dotenv()

ONE_TIME_RUN = True

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
client = instructor.patch(OpenAI(api_key=os.getenv("OPENAI_API_KEY")))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)


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


def gen_ai_synthesis(articles, emphasis_on=None):
    try:
        response1 = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_model=models.UnbiasedResponse,
            messages=[
                {
                    "role": "system",
                    "content": f"Given a list of articles, write a long, cumulative, detailed, unbiased news report. {'In your report, place an emphasis on the article below.' if emphasis_on is not None else ''} Provide a title as well. Aim for at least 500 words.",
                },
                {
                    "role": "user",
                    "content": f"{list(map(lambda x: x['text'], articles))}",
                },
                {
                    "role": "user",
                    "content": f"List of article titles: {list(map(lambda x: x['title'], articles))}",
                },
            ]
            + (
                [
                    {
                        "role": "user",
                        "content": f"This article is the most recent and important: {emphasis_on['text']}.",
                    }
                ]
                if emphasis_on is not None
                else []
            ),
        )
        response2 = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_model=models.ArticleData,
            messages=[
                {
                    "role": "system",
                    "content": "Extract information in the given format.",
                },
                {
                    "role": "user",
                    "content": response1.text,
                },
            ],
        )
        response1 = response1.model_dump()
        response2 = response2.model_dump()
        print("response1", response1)
        print("response2", response2)
        return {
            "synthesis": response1.get("text", None),
            "title": response1.get("title", None),
            "key_takeaways": response2.get("key_takeaways", None),
            "people": response2.get("people", None),
            "events": response2.get("events", None),
            # "complexities": response2.complexities,
            "statistics": response2.get("statistics", None),
        }
    except Exception as e:
        # print(e)
        # print(response1)
        # print(response2)
        return {
            "synthesis": None,
            "title": None,
            "key_takeaways": None,
            "people": None,
            "events": None,
            "statistics": None,
        }


# def gen_ai_fill_details_given_synthesis(cluster, synthesis):
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         response_model=models.ArticleData,
#         messages=[
#             {
#                 "role": "system",
#                 "content": "Extract the key terms, key takeaways, locations, people, events, complexities, and statistics from any given news article.",
#             },
#             {
#                 "role": "user",
#                 "content": synthesis,
#             },
#         ],
#     )
#     cluster["key_takeaways"] = response.key_takeaways
#     cluster["people"] = response.people
#     cluster["events"] = response.events
#     cluster["complexities"] = response.complexities
#     cluster["statistics"] = response.statistics
#     return cluster
# cluster["locations"] = response.locations


def get_clusters(articles_data=None):
    # Get all vectors from Pinecone (or local)
    global supabase

    threshold = 0.8

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

            for cluster_of_articles in grouped_articles.values():
                row_id = str(uuid.uuid4())

                # cluster = {"id": row_id, "article_ids": cluster_of_articles}

                if len(cluster_of_articles) >= 3:
                    try:
                        cluster = gen_ai_synthesis(
                            [
                                mappings[article_id]
                                for article_id in cluster_of_articles
                            ][-4:]
                        )
                    except Exception as e:
                        print(e)
                        print(cluster_of_articles)
                        continue
                    # print(cluster)
                    try:
                        supabase.table("clusters").upsert(
                            {
                                "id": row_id,
                                "article_ids": cluster_of_articles,
                                "synthesis": cluster["synthesis"],
                                "title": cluster["title"],
                                "key_takeaways": cluster["key_takeaways"],
                                "people": cluster["people"],
                                "events": cluster["events"],
                                "statistics": cluster["statistics"],
                            }
                        ).execute()
                    except Exception as e:
                        print(e)
                        print(cluster.keys())
                        print(cluster)
                else:
                    supabase.table("clusters").upsert(
                        {
                            "id": row_id,
                            "article_ids": cluster_of_articles,
                        }
                    ).execute()

                # def fill_and_submit_to_db(article_id):
                #     article = mappings[article_id]

                #     supabase.table("articles").insert(
                #         {
                #             "id": article_id,
                #             "cluster_id": row_id,
                #             "text": article["text"],
                #             "title": article["title"],
                #             "authors": article["authors"],
                #             "publish_date": datetime.now().isoformat(),
                #             "top_image": article["top_image"],
                #             "images": (article["images"] or [])[:5],
                #             "movies": (article["movies"] or [])[:5],
                #             "keywords": article["keywords"],
                #             "summary": article["summary"],
                #             "publisher": article["brand"],
                #         }
                #     ).execute()

                # with concurrent.futures.ThreadPoolExecutor() as executor:
                #     for article_id in cluster_of_articles:
                #         [*executor.map(fill_and_submit_to_db, article_id)]

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
                    cluster = {"id": row_id, "article_ids": [article["id"]]}

                    cluster = gen_ai_synthesis(cluster, [article])
                    cluster = gen_ai_fill_details_given_synthesis(
                        cluster, cluster["synthesis"]
                    )

                    data, _ = supabase.table("clusters").insert(cluster).execute()
                else:
                    old_cluster_ids = [
                        supabase.table("articles")
                        .select("cluster_id")
                        .eq("id", f)
                        .execute()
                        for f in filtered
                    ]
                    row_id = old_cluster_ids[0]
                    for old in old_cluster_ids[1:]:
                        supabase.table("articles").update({"cluster_id": row_id}).eq(
                            "cluster_id", old
                        ).execute()

                    cluster = {
                        "id": row_id,
                        "article_ids": [article["id"]]
                        + supabase.table("articles")
                        .select("id")
                        .eq("cluster_id", row_id)
                        .execute(),
                    }

                    gen_ai_synthesis(
                        cluster,
                        [article]
                        + [mappings[article_id] for article_id in filtered][-3:],
                        article,
                    )
                    gen_ai_fill_details_given_synthesis(cluster, cluster["synthesis"])

                    supabase.table("clusters").update(cluster).eq(
                        "id", row_id
                    ).execute()
                    supabase.table("clusters").delete().contained_by(
                        "id", filtered
                    ).execute()

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
    # with open("local_vectors.json") as f:
    #     articles_data = json.load(f)["vectors"][:100]
    #     with open("small_vectors.json", "w") as g:
    #         json.dump(articles_data, g)
    # get_cluster_articles("3db1e0a5-c4c4-41bd-ba54-0f455ec54151")
