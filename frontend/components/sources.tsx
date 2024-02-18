interface Article {
    id: string; // Assuming each article has a unique ID
    title: string;
    publisher: string;
    url: string;
    // Add other fields as necessary
  }
  
  interface SourcesProps {
    articles: Article[];
  }
  
  export function Sources({ articles }: SourcesProps) {
    return (
    <div style={{ display: 'flex', overflowX: 'auto', width: '50%', height: '20vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ display: 'flex', gap: '10px'}}>
            {articles.map((article) => (
                <div key={article.id} style={{ width: '15vw', height: '15vh', padding: '1vh', borderRadius: '0.5vw', boxShadow: '0 2px 5px rgba(0,0,0,0.1'}}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none'}}>
                    <h4 style={{ pointerEvents: 'none' }}>{article.title} - {article.publisher.toUpperCase()}</h4>
                    </a>
                </div>
            ))}
        </div>
      </div>
    );
  }