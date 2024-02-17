import ast
import newspaper as n3k
import pandas as pd
from multiprocessing.pool import ThreadPool
from multiprocessing import Pool
import sys
import concurrent.futures

status = 0
total = 0


def get_categories(websites):
    built_sites = list(
        map(
            lambda website: n3k.build(website, language="en", memoize_articles=False),
            websites,
        )
    )
    categories = []
    for site in built_sites:
        categories += site.category_urls()


def scrape_articles(websites):
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
    # for i, val in enumerate(map(
    #         lambda website: [
    #             n3k.build(website[0], language="en", memoize_articles=False),
    #             website[1],
    #         ],
    #         websites,
    # )):

    urls = []

    # n3k.news_pool.set(built_sites, threads_per_source=2)
    # n3k.news_pool.join()
    def g(site):
        links = site[0].article_urls()
        return [[link, site[1]] for link in links]

    print()
    with concurrent.futures.ThreadPoolExecutor() as executor:
        n = len(built_sites)
        for i, result in enumerate(executor.map(g, built_sites)):
            urls += result
            print("Processed articles from", i, "/", n, "websites")
    # for site in built_sites:
    #     links = site[0].article_urls()
    #     urls += [[link, site[1]] for link in links]
    return urls


def format_article(url):
    try:
        article = n3k.Article(url[0], language="en")
        article.download()
        article.parse()
        article.nlp()
        return [article, url[1]]
    except Exception as e:
        print("Failed", url, e)
        return None


def process_articles(articles):
    usable_data = []
    advertisements = []
    for i, (a, brand) in enumerate(articles):
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
        }
        if " ad " in a.text or " advertisement " in a.text:
            advertisements.append(out)
        else:
            usable_data.append(out)
        if (i + 1) % 100 == 0 or i == len(articles) - 1:
            print(f"Processed {i}/{len(articles)} articles")
            udf = pd.DataFrame(usable_data)
            adf = pd.DataFrame(advertisements)
            udf.to_json("articles.json", orient="records")
            adf.to_json("advertisements.json", orient="records")


if __name__ == "__main__":
    # websites = [
    #     "http://cnn.com",
    #     "http://foxnews.com",
    #     "https://www.washingtonpost.com/",
    #     # "https://www.bbc.com/news",
    # ]
    # f = open("websites.txt", "w")
    # for i, website in enumerate(websites):
    #     print(i, website)
    #     f.write(f"{[website, n3k.build(website, language='en').brand]}\n")
    # f.close()

    # FOR GETTING WEBSITES / CATEGORIES FIRST
    # ----
    # websites = n3k.popular_urls()
    # def get_brand(website):
    #     return [website, n3k.build(website, language="en").brand]

    # with concurrent.futures.ThreadPoolExecutor() as executor:
    #     results = []
    #     proc = 0
    #     l = len(websites)
    #     for result in executor.map(get_brand, websites):
    #         proc += 1
    #         print(f"Processed {proc}/{l} URLs")
    #         results.append(result)

    # with open("websites.txt", "w") as f:
    #     for result in results:
    #         f.write(f"{result}\n")

    # sys.exit()
    # ----
    # print("Starting to scrape")

    # CODE FOR SCRAPING URLS GIVEN BRANDS
    # ----
    # with open("websites.txt", "r") as f:
    #     websites = list(map(lambda x: ast.literal_eval(x), f.readlines()))

    # urls = []
    # while len(urls) == 0:
    #     urls = scrape_articles(websites)
    #     if len(urls) == 0:
    #         print("No urls found, trying again")
    #     else:
    #         print("Scraping done", len(urls))

    # status = 0
    # with open("links.txt", "w") as f:
    #     for url in urls:
    #         f.write(f"{url}\n")
    # sys.exit()
    # ----

    # CODE FOR ARTICLE PROCESSING
    # ---

    with open("links.txt") as f:
        urls = list(map(lambda line: ast.literal_eval(line.strip()), f.readlines()))
        n = len(urls)

    print("Starting to get articles")
    articles = []
    # with Pool(4) as pool:
    with concurrent.futures.ThreadPoolExecutor() as executor:
        for i, result in enumerate(executor.map(format_article, urls)):
            print("Formatted", i, "/", n, "urls")
            if result is not None:
                articles.append(result)
    # with ThreadPool(4) as pool:
    #     articles = list(filter(lambda x: x, pool.map(format_article, urls)))

    print("Processing articles")
    process_articles(articles)
    print("Processing done")
    # articles = process_articles(urls)
    # articles.to_csv("articles.csv", index=False)
    # ---
