import json

def filter_importance(entities, importance_threshold):
    if not entities:
        return {}
    return {entity['name']: entity for entity in entities if entity['importance'] > importance_threshold}

with open('new_example_structured_data.json', 'r') as file:
    structured_data = json.load(file)

for article, article_data in structured_data.items():
    people_importance = filter_importance(article_data['people'], 3)
    organization_importance = filter_importance(article_data['organizations'], 3)
    location_importance = filter_importance(article_data['locations'], 4)

    if len(people_importance) + len(organization_importance) > 3:
        people_importance = filter_importance(article_data['people'], 4)
        organization_importance = filter_importance(article_data['organizations'], 4)

    people_importance.update(organization_importance)
    importants = people_importance

    output = {
        "title": article,
        "summary": article_data['summary'],
        "key_takeaways": article_data['key_takeaways'],
        "importants": importants,
        "location": location_importance,
        "bias": "BIAS",
    }

    print(output, "\n\n")