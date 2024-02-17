import openai
from openai import OpenAI
from newspaper import Article
import nltk
import dotenv
import os
import json
import instructor
from pydantic import BaseModel, Field
from typing import List, Optional, Union

dotenv.load_dotenv()

client = instructor.patch(OpenAI())


# Define the people model:
class Person(BaseModel):
    name: str = Field(..., description="The name of the person")
    importance: int = Field(1, description="The importance of the person in the article. 1 is the lowest, 5 is the highest.")
    role: Optional[str] = Field(None, description="The role/position/title of the person broadly. If unavailable, their role in the story.")
    description: Optional[str] = Field(None, description="A description of the person")

class Organization(BaseModel):
    name: str = Field(..., description="The name of the organization")
    importance: int = Field(1, description="The importance of the organization in the article. 1 is the lowest, 5 is the highest.")
    description: Optional[str] = Field(None, description="A description of the organization and its importance to the article")
    people: Optional[List[Person]] = Field(None, description="People associated with the organization mentioned in the article")

class Location(BaseModel):
    name: str = Field(..., description="The name of the location")
    importance: int = Field(1, description="The importance of the location in the article. 1 is the lowest, 5 is the highest.")
    description: Optional[str] = Field(None, description="The role of/why the location is relevant to the story")

class Date(BaseModel):
    date: str = Field(..., description="The date")
    description: str = Field(..., description="What happened on the date")

class Statistic(BaseModel):
    name: str = Field(..., description="The name of the statistic")
    importance: int = Field(1, description="The importance of the statistic in the article. 1 is the lowest, 5 is the highest.")
    value: str = Field(..., description="The value of the statistic")
    description: Optional[str] = Field(None, description="What it signifies or why its important")

class Connection(BaseModel):
    person1: str = Field(..., description="The name of the first person in the connection")
    person2: str = Field(..., description="The name of the second person in the connection")
    description: Optional[str] = Field(None, description="A description of the connection and its relevance to the article")

class Quote(BaseModel):
    quote: str = Field(..., description="The quote")
    importance: int = Field(1, description="The importance of the quote in the article. 1 is the lowest, 5 is the highest.")
    speaker: str = Field(..., description="The name of the person who said the quote")
    description: Optional[str] = Field(None, description="The relevance of the quote to the broader article")

class Event(BaseModel):
    title: str = Field(..., description="The title of the event")
    importance: int = Field(1, description="The importance of the event in the article. 1 is the lowest, 5 is the highest.")
    description: str = Field(None, description="A description of the event, and its significance to the article")
    date: str = Field(None, description="The date of the event")
    time: Optional[str] = Field(None, description="The time of the event")
    location: Optional[str] = Field(None, description="The location of the event")
    participants: Optional[List[Union[Person, Organization]]] = Field(None, description="The relevant parties to the event")

class ArticleData(BaseModel):
    people: Optional[List[Person]] = None
    organizations: Optional[List[Organization]] = None
    locations: Optional[List[Location]] = None
    dates: Optional[List[Date]] = None
    statistics: Optional[List[Statistic]] = None
    connections: Optional[List[Connection]] = None  
    quotes: Optional[List[Quote]] = None  
    events: Optional[List[Event]] = None  


import networkx as nx
import matplotlib.pyplot as plt

def visualize_network(article_data):
    G = nx.Graph()
    for person in article_data.people:
        G.add_node(person.name)


    for connection in article_data.connections:
        # Add edges without attaching the description as an attribute
        G.add_edge(connection.person1, connection.person2)


    pos = nx.spring_layout(G)  # Positions nodes using the spring layout
    nx.draw(G, pos, with_labels=True, node_color='skyblue', node_size=2000, edge_color='k', linewidths=1, font_size=10)


    plt.show()



with open('articles_data.json', 'r') as file:
    articles_data = json.load(file)

for article in articles_data[3:8]:
    print(f"{article['title']}: {article['summary'][:100]}...")

    try:
        article_info = client.chat.completions.create(
            model="gpt-4-1106-preview",
            response_model=ArticleData,
            messages=[
                {
                    "role": "system",
                    "content": "Extracting people, organizations, locations, dates, and statistics from the article.",
                },
                {
                    "role": "user",
                    "content": article['article_text'],
                },
            ]
        )

        print(article_info.model_dump_json(indent=2))
        # visualize_network(article_info)
    except Exception as e:
        print(f"Failed to process article: {e}")