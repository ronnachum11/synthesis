from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
from collections import defaultdict

class UnionFind:
    def __init__(self, size):
        self.root = list(range(size))
    
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

with open('articles_data.json', 'r') as file:
    articles_data = json.load(file)

articles_keywords = [' '.join(article['keywords']) for article in articles_data]
articles_texts = [article['article_text'] for article in articles_data]

tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(articles_texts)

cosine_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Initialize UnionFind
uf = UnionFind(len(articles_data))

# Group articles based on similarity threshold
threshold = 0.6
for i in range(len(articles_data)):
    for j in range(i + 1, len(articles_data)):
        if cosine_sim_matrix[i, j] > threshold:
            uf.union(i, j)

# Group articles by their root
grouped_articles = defaultdict(list)
for i in range(len(articles_data)):
    root = uf.find(i)
    grouped_articles[root].append(i)

# Sort groups by size from largest to smallest before printing
for group in sorted(grouped_articles.values(), key=len, reverse=True):
    titles = [articles_data[i]['title'] for i in group]
    print('\n'.join(titles), end='\n\n\n')