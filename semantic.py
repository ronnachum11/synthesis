from pinecone import Pinecone
import supabase
import instructor
from openai import OpenAI
import os
from dotenv import load_dotenv
from supabase import create_client
from gpt4all import Embed4All
import uuid

load_dotenv()

pc = Pinecone(api_key="a69bc407-de77-4737-b85a-8905630bb045")
index = pc.Index("semantic-search")
client = instructor.patch(OpenAI(api_key=os.getenv("OPENAI_API_KEY")))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

syntheses = supabase.table("clusters").select("*").neq("synthesis", None).execute().data

# print(syntheses[0]["synthesis"])

vectors = []
embedder = Embed4All()

for i, synth_dict in enumerate(syntheses):
    synth_arr = synth_dict["synthesis"].split(". ")
    synth_arr = [
        synth_arr[i] + ". " + synth_arr[i + 1] for i in range(0, len(synth_arr) - 1, 2)
    ]
    for s in synth_arr:
        meta = synth_dict.copy()
        vectors.append(
            {
                "id": str(uuid.uuid4()),
                "values": embedder.embed(s),
                "metadata": {"cluster_id": meta["id"], "excerpt": s},
            }
        )
    if i % 5 == 0 or i == len(syntheses) - 1:
        print(f"Processed {i + 1} / {len(syntheses)}")
        index.upsert(vectors)
