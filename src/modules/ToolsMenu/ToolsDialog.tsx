import {DialogBase} from "../../utils/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../utils/DialogComponents";
import {DOM} from "../../utils/DOM";
import tools from "../../tools/ToolsList";
import {ITool, IToolConfig} from "../../tools/ITool";

export class ToolsDialog extends DialogBase<null> {

    private _currentTool: ITool;
    private _currentToolConfig: IToolConfig;

    public show() {
        this._currentTool = null;
        this.internalShow();
    }

    private onClickUse = (e: Event) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;

        const key = target.getAttribute("data-id");
        if(!key) {
            alert("Could not find the tool id.");
            return;
        }

        const toolCfg = tools[key];
        if(!toolCfg) {
            alert("Could not find tool.");
            return;
        }

        const tool: ITool = toolCfg.factory();
        this.setTool(tool, toolCfg);
    };

    private setTool(tool :ITool | null, cfg: IToolConfig | null) {
        this._currentTool = tool;
        this._currentToolConfig = cfg;
       this.rerender();
    }

    private onGoBack = (e: Event) => {
        e.stopPropagation();
        this.setTool(null, null);
    };

    protected render(): HTMLElement {

        if(this._currentTool && this._currentToolConfig) {
            const toolWidget = this._currentTool.show();
            return (
                <Dialog>
                    <DialogHeader>
                        <h1>{this._currentToolConfig.name}</h1>
                    </DialogHeader>

                    <DialogBody>
                        {toolWidget}
                    </DialogBody>

                    <DialogFooter>
                        <DialogFooterContent>
                            <button className="btn" onClick={this.close}>Close</button>
                            <button className="btn" onclick={this.onGoBack}>Back</button>
                        </DialogFooterContent>
                    </DialogFooter>
                </Dialog>
            );
        }

        this._currentTool = null;
        this._currentToolConfig = null;

        const boxes = [];
        const elemStyle = {
            marginTop: "auto",
            marginBottom: "auto",
            paddingLeft: "8px",
            paddingRight: "8px",
        };

        for (let toolsKey in tools) {

            const toolCfg = tools[toolsKey];

            boxes.push(<b style={elemStyle}>{toolCfg.name}</b>);
            boxes.push(<div style={elemStyle}>{toolCfg.description}</div>);
            boxes.push(<button onClick={this.onClickUse} data-id={toolsKey} style={elemStyle} className="btn btn-info">Use</button>);
        }

        return (
            <Dialog>
                <DialogHeader>
                    <h1>Tools</h1>
                </DialogHeader>

                <DialogBody>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>
                        {boxes}
                    </div>
                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent>
                        <button className="btn" onclick={this.close}>Close</button>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>
        )
    }

}
