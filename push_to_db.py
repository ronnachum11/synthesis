from pinecone import Pinecone, PodSpec
from gpt4all import Embed4All
from dotenv import load_dotenv
import os
import json
import uuid
from ast import literal_eval
import datetime

load_dotenv()

vec_sz = 384

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
# index = pc.Index("news-articles")
# pinecone.init(
#     api_key=os.getenv("PINECONE_API_KEY"),
#     environment=os.getenv("PINECONE_ENVIRONMENT"),
# )
embedder = Embed4All()

ONE_TIME_RUN = True


def upload_all():
    with open("articles.json") as f:
        data = json.load(f)
        # data = literal_eval(f.read())

    vectors = []

    print(type(data))

    index_name = "news-articles"

    # if index_name not in pc.list_indexes():
    #     pc.create_index(
    #         name=index_name, metric="cosine", dimension=384, spec=PodSpec.index
    #     )

    print("Embedding...")

    if ONE_TIME_RUN:
        local_vectors = []

    with pc.Index(index_name, pool_threads=30) as index:
        for i, row in enumerate(data["articles"]):
            # if i % 10 == 0:
            print(f"Embedding {i}/{len(data['articles'])}", len(row["text"]))

            if "text" not in row or not row["text"]:
                continue

            new_id = str(uuid.uuid4())
            values = embedder.embed(row["text"])
            vec = {"id": new_id, "values": values}

            vectors.append(vec)

            if ONE_TIME_RUN:
                row["id"] = new_id
                row["values"] = values
                local_vectors.append(row)

            if i % 100 == 0 or i == len(data["articles"]) - 1:
                print(f"Upserting {i}/{len(data['articles'])}")
                index.upsert(vectors=vectors)
                vectors = []
                if ONE_TIME_RUN:
                    v = {"vectors": local_vectors}
                    with open("local_vectors.json", "w") as f:
                        json.dump(v, f)

    print("Uploading...")

    # with pc.Index(index_name, pool_threads=30) as index:
    #     chunks = [vectors[i : i + 500] for i in range(0, len(vectors), 500)]
    #     async_results = [
    #         index.upsert(vectors=chunk, async_req=True) for chunk in chunks
    #     ]
    #     for i, async_result in enumerate(async_results):
    #         print(f"Upserting chunk {i + 1}/{len(chunks)}")
    #         async_result.get()


if __name__ == "__main__":
    upload_all()
