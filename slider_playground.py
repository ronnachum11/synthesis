import argparse
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('index', type=int, help='Index of the article to print')
args = parser.parse_args()

with open('articles_data.json', 'r') as file:
    articles_data = json.load(file)

articles_keywords = [' '.join(article['keywords']) for article in articles_data]
articles_texts = [article['article_text'] for article in articles_data]

print(articles_data[args.index]['title'], "\n\n")

def naive_llm_adjust_article_complexity(article_text, target_complexity):
    """
    Adjusts the complexity of the given article text to the target complexity level.
    Target complexity is a scale from 0 (3rd grade) to 1 (PhD).
    """
    # Mapping the target complexity to a descriptive level for the prompt
    complexity_descriptions = {
        0: "for a third-grade student",
        0.25: "for a middle school student",
        0.5: "for a high school student",
        0.75: "for a college student",
        1: "for a PhD student",
    }
    closest_complexity = min(complexity_descriptions.keys(), key=lambda x: abs(x - target_complexity))
    complexity_level = complexity_descriptions[closest_complexity]

    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
            messages=[
                {"role": "user", "content": f"Please adjust the complexity of the following text to be suitable {complexity_level}:\n\n{article_text}"}
            ]
        )

    return response.choices[0].message.content

old_text = articles_data[args.index]['summary']
new_text = naive_llm_adjust_article_complexity(old_text, 0.25)
print("OLD TEXT:\n", old_text, "\n\nNEW TEXT:\n", new_text)
