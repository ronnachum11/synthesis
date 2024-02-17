from textblob import TextBlob
import json

with open('articles_data.json', 'r') as file:
    articles_data = json.load(file)

def simplify_text(text, level='elementary'):
    blob = TextBlob(text)
    simplified_text = text  # Default to original text
    
    # Example of a very basic approach to adjust the text based on the level
    if level == 'elementary':
        # Using noun phrases to simplify the text might be one approach
        simplified_text = '. '.join(blob.noun_phrases)
    elif level == 'middle':
        # For middle school, perhaps simplifying sentences but keeping more content than elementary
        simplified_text = '. '.join([str(sentence) for sentence in blob.sentences[:len(blob.sentences)//2]])
    elif level == 'high':
        # High school level might involve minimal simplification
        simplified_text = text
    # For college and PhD, more sophisticated techniques would be needed, potentially beyond the scope of textblob
    
    return simplified_text


old_text = articles_data[11]['summary']
new_text = simplify_text(old_text, 'middle')
print("OLD TEXT:\n", old_text, "\n\nNEW TEXT:\n", new_text)