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
import newspaper as n3k

load_dotenv()


class UnionFind:
    def __init__(self, data):
        self.root = {data["id"]: data["id"] for article in data}

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
        url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY")
        self.supabase = create_client(url, key)
        self.article_pinecone = Pinecone(
            api_key=os.environ.get("ARTICLE_PINECONE_API_KEY")
        )
        self.synthesis_pinecone = Pinecone(
            api_key=os.environ.get("SYNTHESIS_PINECONE_API_KEY")
        )
        self.embedder = Embed4All()

    def s1_load_new_articles(self):
        # Load popular websites from N3K
        with open("sites.txt", "r") as f:
            websites = list(map(lambda x: x.strip(), f.readlines()))

        # Get all links from websites
        def get_brand(site):
            return (
                site,
                n3k.build(site, language="en").brand,
            )

        links_with_brand = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            links_with_brand = list(executor.map(get_brand, websites))

        # Scrape new articles
        def get_build(site):
            return n3k.build(site[0], language="en"), site[1]

        with concurrent.futures.ThreadPoolExecutor() as executor:
            built_sites = list(executor.map(get_build, links_with_brand))

        # Get all urls
        def get_urls(site):
            links = site[0].article_urls()
            return [[link, site[1]] for link in links]

        with concurrent.futures.ThreadPoolExecutor() as executor:
            urls = list(executor.map(get_urls, built_sites))

        for u in urls:
            print(u)

    def run(self):
        self.s1_load_new_articles()


if __name__ == "__main__":
    scraper = Scraper()
    scraper.run()
