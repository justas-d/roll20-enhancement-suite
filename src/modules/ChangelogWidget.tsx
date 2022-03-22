import {DOM} from "../utils/DOM";
import {strIsNullOrEmpty} from "../utils/MiscUtils";
import {Config} from "../utils/Config";
import MediaWidget from "../MediaWidget";
import * as semverCompare from "semver-compare";

interface IChangelog {
    current: string;
    versions: { [version: string]: IVersion };
}

interface IChange {
    id: string;
    content: string;
    urls: {[id: string]: string};
}

interface IChangelogInfo {
    title: string;
    media: string;
}

interface IVersion {
    info: IChangelogInfo;
    changes: IChange[];
}

interface PreparedVersion {
    data: IVersion;
    semverString: string;
    mediaUrl: string | null;
}

class ChangelogWidget extends DOM.ElementBase {
    private preparedData: PreparedVersion[] = [];
    private isLoading: boolean = true;

    public constructor({listAllVersions}: any) {
        super();

        const changelogData: IChangelog = JSON.parse(BUILD_CONSTANT_CHANGELOG);

        if (listAllVersions) {
            //console.log("in list all");
            //console.log(changelogData.versions);
            for (const versionName in changelogData.versions) {
                this.prepareChanges(changelogData.versions[versionName], versionName)
            }

        } else {
            //console.log("in else");
            const current = changelogData.versions[changelogData.current];
            this.prepareChanges(current, changelogData.current)
        }

        this.preparedData.sort((a, b) => {
            return semverCompare(b.semverString, a.semverString);
        });

    }

    private prepareChanges(version: IVersion, semverString: string) {
        //console.log(`prep ${version.info.title}`);
        this.preparedData.push({
            data: version,
            mediaUrl: strIsNullOrEmpty(version.info.media) ? "" : Config.website + version.info.media,
            semverString: semverString
        })
    }

    private onClickLine = (e) => {
        e.stopPropagation();
        const url = e.target.getAttribute("data-url");
        if (!url) return;
        window.open(url, "_blank");
    };

    protected internalRender(): HTMLElement {

        if (this.preparedData.length <= 0) {
            return (
                <div>
                    {this.isLoading ? "Loading..." : "We have no changes to display :/... What?"}
                </div>
            )
        }

        const buildVersionHtml = (version: PreparedVersion): HTMLElement => {
            const list = [];

            for (const change of version.data.changes) {
                let urlHyperlinks = [];
                for(const msg in change.urls) {
                    const url = change.urls[msg];

                    urlHyperlinks.push(<div><a href={url}>{msg}</a></div>);
                }

                list.push(strIsNullOrEmpty(change.id)
                    ? <li>{change.content}{urlHyperlinks}</li>
                    : <li><a data-url={Config.websiteFeatureUrlTemplate + change.id} href="javascript:void(0)"
                             onClick={this.onClickLine}>{change.content}</a>{urlHyperlinks}</li>);
            }

            const headerWidget = version.data.info.title
                ? <div>
                    <h2>{version.data.info.title}</h2>
                    <h3>{version.semverString}</h3>
                </div>
                : <div>
                    <h2>{version.semverString}</h2>
                </div>;

            return (
                <ul>
                    {headerWidget}

                    {!strIsNullOrEmpty(version.mediaUrl) &&
                    <MediaWidget url={version.mediaUrl} description=""/>
                    }

                    {list}
                    <hr/>
                </ul>
            );
        };

        return (
            <div>
                {this.preparedData.map(buildVersionHtml)}
            </div> as HTMLElement
        );
    }

}

export default ChangelogWidget;
