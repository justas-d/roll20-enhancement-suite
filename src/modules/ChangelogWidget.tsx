import { DOM } from "../tools/DOM";

declare namespace build {
    export const R20ES_CHANGELOG: string;
    export const R20ES_VERSION: string;
}

const ChangelogWidget = function(props: any) {
    const paragraphs = build.R20ES_CHANGELOG.split('\n');
        
    return (
        <div>
            <h2>{build.R20ES_VERSION}</h2>
            {paragraphs.map(text => <p>{text}</p>)}
        </div>
    );
}

export default ChangelogWidget;
