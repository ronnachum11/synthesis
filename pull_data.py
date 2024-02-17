from newspaper import Article, build
import json

site_build = build('https://cnn.com', memoize_articles=False)

articles = site_build.articles[:50]

articles_data = []  # List to hold dictionaries of article details

for i, article in enumerate(articles):
    try:
        article = Article(article.url)
        article.download()
        article.parse()
        article.nlp()
        print(f"Processed article {i}: {article.url}")
    except:
        print(f"Failed article {i}: {article.url}")
        continue

    # Create a dictionary for the current article
    article_details = {
        "title": article.title,
        "authors": article.authors,
        "publish_date": str(article.publish_date),
        "top_image_url": article.top_image,
        "article_text": article.text,
        "keywords": article.keywords,
        "summary": article.summary
    }

    # Add the dictionary to the list
    articles_data.append(article_details)

# Write the list of dictionaries to a JSON file
with open('articles_data.json', 'w') as json_file:
    json.dump(articles_data, json_file, indent=4)