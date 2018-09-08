import { DOM } from "../tools/DOM";
import { strIsNullOrEmpty } from "../tools/MiscUtils";

declare namespace build {
    export const R20ES_CHANGELOG: string;
    export const R20ES_VERSION: string;
}

const ChangelogWidget = function (props: any) {
    const paragraphs = build.R20ES_CHANGELOG.split('\n');

    const lis = [];
    for(const p of paragraphs) {
        if(strIsNullOrEmpty(p)) continue;
        lis.push(<li>{p}</li>);
    }
    
    return (
        <ul>
            <h2>{build.R20ES_VERSION}</h2>
            {lis}
        </ul>
    );
}

export default ChangelogWidget;
