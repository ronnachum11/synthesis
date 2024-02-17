import newspaper

with open("sites.txt", "w") as f:
    f.write("\n".join(newspaper.popular_urls()))