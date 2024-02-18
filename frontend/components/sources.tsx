
interface SourcesProps {
    sources: any[];
}

export function Sources({ sources }: SourcesProps) {
    return (
        <div>
            <h3>Sources</h3>
            <ul>
                {sources.map((source, index) => (
                    <li key={index}>{source}</li>
                ))}
            </ul>
        </div>
    );
}
