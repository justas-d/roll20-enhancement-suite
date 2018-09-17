import {DOM} from "../tools/DOM";
import {getExtUrlFromPage, strIsNullOrEmpty} from "../tools/MiscUtils";
import {Config} from "../tools/Config";
import MediaWidget from "../MediaWidget";

declare namespace build {
    export const R20ES_CHANGELOG: string;
    export const R20ES_VERSION: string;
}

interface IChange {
    id: string;
    content: string;
}

interface IChangelogInfo {
    title: string;
    media: string;
}

interface IChangelog {
    info: IChangelogInfo;
    changes: IChange[];
}

class ChangelogWidget extends DOM.ElementBase {

    private changelogData: IChangelog;
    private mediaUrl: string;

    public constructor() {
        super();

        this.changelogData = JSON.parse(build.R20ES_CHANGELOG);

        if (!strIsNullOrEmpty(this.changelogData.info.media)) {
            getExtUrlFromPage(this.changelogData.info.media, 5000)
                .then(url => {
                    this.mediaUrl = url;
                    this.rerender();
                })
                .catch(err => console.error(`Failed to get ${this.changelogData.info.media}: ${err}`));
        }
    }

    private onClickLine = (e) => {
        e.stopPropagation();
        const url = e.target.getAttribute("data-url");
        if (!url) return;
        window.open(url, "_blank");
    };

    protected internalRender(): HTMLElement {

        const list = [];
        for (const data of this.changelogData.changes) {
            list.push(strIsNullOrEmpty(data.id)
                ? <li>{data.content}</li>
                : <li><a data-url={Config.websiteFeatureUrlTemplate + data.id} href="javascript:void(0)"
                         onClick={this.onClickLine}>{data.content}</a></li>);
        }

        const headerWidget = this.changelogData.info.title
            ? <div>
                <h2>{this.changelogData.info.title}</h2>
                <h3>{build.R20ES_VERSION}</h3>
            </div>
            : <div>
                <h2>{build.R20ES_VERSION}</h2>
            </div>;

        return (
            <ul>
                {headerWidget}

                {!strIsNullOrEmpty(this.mediaUrl) &&
                <MediaWidget url={this.mediaUrl} description=""/>
                }

                {list}


            </ul>
        );
    }

}

export default ChangelogWidget;
