from pinecone import Pinecone
from gpt4all import Embed4All
from dotenv import load_dotenv
import os
import json
import uuid

load_dotenv()

vec_sz = 384

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("news-articles")


def upload_all():
    with open("articles.json") as f:
        data = json.load(f)

    vectors = []

    for row in data["articles"]:
        vectors.append(
            {
                "id": str(uuid.uuid4()),
                "values": Embed4All().embed(row["text"]),
                "metadata": row,
            }
        )

    index.upsert(vectors)


if __name__ == "__main__":
    upload_all()
