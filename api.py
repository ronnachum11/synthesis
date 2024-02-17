import newspaper as n3k
import pandas as pd
from multiprocessing.pool import ThreadPool
from multiprocessing import Pool
import sys
import concurrent.futures
from pinecone import Pinecone, PodSpec
from gpt4all import Embed4All
from dotenv import load_dotenv
import os
import json
import uuid
import datetime

load_dotenv()


class Scraper:
    def __init__(self):
        self.ONE_TIME_RUN = False
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.embedder = Embed4All()

    def get_categories(self, websites):
        built_sites = list(
            map(
                lambda website: n3k.build(
                    website, language="en", memoize_articles=True
                ),
                websites,
            )
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
            if " ad " in a.text or " advertisement " in a.text:
                advertisements.append(out)
            else:
                usable_data.append(out)
            if (i + 1) % 100 == 0 or i == len(articles) - 1:
                print(f"Processed {i}/{len(articles)} articles")
                return usable_data
                # udf = pd.DataFrame(usable_data)
                # adf = pd.DataFrame(advertisements)
                # udf.to_json("articles.json", orient="records")
                # adf.to_json("advertisements.json", orient="records")

    def main(self):
        websites = n3k.popular_urls()

        def get_brand(website):
            return [website, n3k.build(website, language="en").brand]

        with concurrent.futures.ThreadPoolExecutor() as executor:
            results = []
            proc = 0
            l = len(websites)
            for result in executor.map(get_brand, websites):
                proc += 1
                print(f"Processed {proc}/{l} URLs")
                results.append(result)

        # with open("websites.txt", "r") as f:
        #     websites = list(map(lambda x: ast.literal_eval(x), f.readlines()))

        websites = results

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
