import newspaper as n3k
import pandas as pd
from multiprocessing.pool import ThreadPool
from multiprocessing import Pool
import sys
import concurrent.futures
from pinecone import Pinecone, PodSpec
from gpt4all import Embed4All
from dotenv import load_dotenv
from supabase import create_client, Client
import os
import json
import uuid
import datetime
from collections import defaultdict

load_dotenv()

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


class Scraper:
    def __init__(self):
        self.ONE_TIME_RUN = False
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.embedder = Embed4All()

    def get_categories(self, websites):
        built_sites = map(
                lambda website: n3k.build(
                    website, language="en", memoize_articles=True
                ),
                websites,
            )
        categories = []
        for site in built_sites:
            categories += site.category_urls()

    def scrape_articles(self, websites):
        built_sites = []

        def f(website):
            return [
                n3k.build(website[0], language="en", memoize_articles=False),
                website[1],
            ]

        with concurrent.futures.ThreadPoolExecutor() as executor:
            n = len(websites)
            for i, result in enumerate(executor.map(f, websites)):
                print("Processed", i, "/", n, "websites")
                built_sites.append(result)

        urls = []

        def g(site):
            links = site[0].article_urls()
            return [[link, site[1]] for link in links]

        print()
        with concurrent.futures.ThreadPoolExecutor() as executor:
            n = len(built_sites)
            for i, result in enumerate(executor.map(g, built_sites)):
                urls += result
                print("Processed articles from", i, "/", n, "websites")
        return urls

    def format_article(self, url):
        try:
            article = n3k.Article(url[0], language="en")
            article.download()
            article.parse()
            article.nlp()
            return [article, url[1]]
        except Exception as e:
            print("Failed", url, e)
            return None

    def process_articles(self, articles):
        usable_data = []
        advertisements = []
        for i, ((a, brand), url) in enumerate(articles):
            out = {
                "text": a.text,
                "title": a.title,
                "authors": a.authors,
                "publish_date": a.publish_date,
                "top_image": a.top_image,
                "images": a.images,
                "movies": a.movies,
                "keywords": a.keywords,
                "summary": a.summary,
                "brand": brand,
                "url": url,
            }
            if not a.text or " ad " in a.text or " advertisement " in a.text or len(a.text) < 250:
                advertisements.append(out)
            else:
                usable_data.append(out)
            if (i + 1) % 100 == 0 or i == len(articles) - 1:
                print(f"Processed {i}/{len(articles)} articles")
                return usable_data

    def main(self):
        # Get websites
        with open("websites.txt", "r") as f:
            websites = list(map(lambda x: x.strip(), f.readlines()))

        def get_brand(website):
            return [website, n3k.build(website, language="en").brand]

        with concurrent.futures.ThreadPoolExecutor() as executor:
            websites = list(executor.map(get_brand, websites))

        urls = []
        while len(urls) == 0:
            urls = self.scrape_articles(websites)
            if len(urls) == 0:
                print("No urls found, trying again")
            else:
                print("Scraping done", len(urls))

        n = len(urls)
        print("Starting to get articles")
        articles = []

        with concurrent.futures.ThreadPoolExecutor() as executor:
            for i, result in enumerate(executor.map(self.format_article, urls)):
                print("Formatted", i, "/", n, "urls")
                if result is not None:
                    articles.append([result, urls[i][0]])

        print("Processing articles")
        data = self.process_articles(articles)
        print("Processing done")

        # DB time
        if self.ONE_TIME_RUN:
            local_vectors = []

        with self.pc.Index("news-articles", pool_threads=30) as index:
            for i, row in enumerate(data["articles"]):
                # if i % 10 == 0:
                print(f"Embedding {i}/{len(data['articles'])}", len(row["text"]))

                if "text" not in row or not row["text"]:
                    continue

                for key in row:
                    if key == "publish_date" and row[key] is None:
                        row[key] = datetime.datetime.now().isoformat()
                    elif row[key] is None:
                        row[key] = ""

                row["text"] = row["text"][:15000]

                vec = {
                    "id": str(uuid.uuid4()),
                    "values": self.embedder.embed(row["text"]),
                    "metadata": row,
                }

                vectors.append(vec)

                if self.ONE_TIME_RUN:
                    local_vectors.append(vec)

                if i % 100 == 0 or i == len(data["articles"]) - 1:
                    print(f"Upserting {i}/{len(data['articles'])}")
                    index.upsert(vectors=vectors)
                    vectors = []
                    
                    if self.ONE_TIME_RUN:
                        v = {"vectors": local_vectors}
                        with open("local_vectors.json", "w") as f:
                            json.dump(v, f)

        # Similarity search
        threshold = 0.75

        if self.ONE_TIME_RUN:
            with open("local_vectors.json") as f:
                articles_data = json.load(f)["vectors"]
                # article_texts = [article["article_text"] for article in articles_data]
                index = self.pc.Index("news-articles")

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
                        # and match["id"] in map(lambda x: x["id"], articles_data)
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

            with self.pc.Index("news-articles", pool_threads=30) as index:
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
                        # and match["id"] in map(lambda x: x["id"], articles_data)
                    ]

                    if len(filtered) == 0:
                        row_id = uuid.uuid4()
                        data, _ = (
                            supabase.table("clusters").insert({"id": row_id}).execute()
                        )
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
                            supabase.table("articles").update({"cluster_id": row_id}).eq("cluster_id", old).execute()


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

                # grouped_articles = defaultdict(list)
                # for ad in articles_data:
                #     root = uf.find(ad["id"])
                #     grouped_articles[root].append(ad["id"])

                # for cluster_root_id, articles_in_cluster in grouped_articles.items():
                #     print("Cluster {}: {}".format(cluster_root_id, articles_in_cluster))
            