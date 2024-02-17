import instructor
from openai import OpenAI
from pydantic import BaseModel
import newspaper as n3k
from dotenv import load_dotenv
import os
from models import SummarizeResponse, UnbiasedResponse

load_dotenv()

client = instructor.patch(OpenAI(api_key=os.getenv("OPENAI_API_KEY")))


articles = [
    "https://www.independent.co.uk/news/world/americas/us-politics/trump-trial-court-live-updates-fraud-new-york-verdict-b2497356.html",
    "https://www.nbcnews.com/politics/donald-trump/ny-fraud-case-damages-pay-millions-judge-engoron-rcna135283",
    "https://www.foxnews.com/media/trumps-ny-penalty-cause-biz-exodus-fl-empire-legal-banana-republic-experts",
    "https://www.cnn.com/2024/02/17/economy/donald-trump-trial-ruling-business/index.html",
    "https://www.nydailynews.com/2024/02/17/more-bills-for-trump-to-not-pay-another-verdict-against-the-con-man/",
]

for a in range(len(articles)):
    articles[a] = n3k.Article(articles[a])
    articles[a].download()
    articles[a].parse()
    articles[a].nlp()
    articles[a] = articles[a].text


# Plug in raw articles and get summary
def testA(model="gpt-3.5-turbo"):
    print(f"[testA model = {model}]")
    response = client.chat.completions.create(
        model=model,
        response_model=SummarizeResponse,
        messages=[
            {
                "role": "system",
                "content": "Given an array of articles, extract the cumulative, unbiased summary.",
            },
            {
                "role": "user",
                "content": f"{articles}",
            },
        ],
    )

    print(response.summary)


# Accumulator / current: Compare pairs of articles to determine the ground truth. Keep doing until you've gone through every article one by one in a unique call.


def testB(model="gpt-3.5-turbo"):
    print(f"[testB model = {model}]")
    summary = articles[0]
    for i, article in enumerate(articles, 1):
        print(i, end=" ", flush=True)
        response = client.chat.completions.create(
            model=model,
            response_model=UnbiasedResponse,
            messages=[
                {
                    "role": "system",
                    "content": "Given two articles, create text that is content common to both articles and write it in an unbiased manner.",
                },
                {
                    "role": "user",
                    "content": f"Article 1: {summary}",
                },
                {
                    "role": "user",
                    "content": f"Article 2: {article}",
                },
            ],
        )
        summary = response.text

    print()
    print(summary)


# For each piece of data (original text, tags), compare and generate ground truth, then generate summary from ensemble of summarized texts and truthified tags


if __name__ == "__main__":
    testA()
    print()
    testB()
