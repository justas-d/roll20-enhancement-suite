import {R20Module} from '../../tools/R20Module'
import {DOM} from '../../tools/DOM'
import {SheetTab, SheetTabSheetInstanceData} from '../../tools/SheetTab';
import {R20} from "../../tools/R20";
import {Character, Token, TokenAttributes} from 'roll20';
import getBlob = R20.getBlob;
import {strIsNullOrEmpty} from "../../tools/MiscUtils";

const AuraEditor = ({tokenAttribs, name, index}) => {
    const radius = `aura${index}_radius`;
    const color = `aura${index}_color`;
    const square = `aura${index}_square`;

    return (
        <div className="inlineinputs" style={{marginTop: "5px"}}>
            <b>{name}</b>

            <InputWrapper propName={radius} type="text" token={tokenAttribs}/>

            <span style={{marginRight: "16px"}}>
            ft.
            </span>

            <span style={{marginRight: "16px"}}>
                <ColorWidget propName={color} token={tokenAttribs}/>
            </span>

            <span>
                <InputWrapper propName={square} type="checkbox" token={tokenAttribs}/>
                Square
            </span>
        </div>
    );
};

const BarEditor = ({name, color, character, tokenAttribs, index}) => {
    const char: Character = character;
    const value = `bar${index}_value`;
    const max = `bar${index}_max`;
    const link = `bar${index}_link`;

    const selectWidget = (
        <select value={tokenAttribs[link]} style={{width: "125px;"}}>
            <option value="">None</option>
            {char.attribs.map(a => <option value={a.id}>{a.attributes.name}</option>)}
        </select>
    );

    setTokenAttributeDataKey(selectWidget, link);

    return (
        <div className="inlineinputs" style={{marginTop: "5px", marginBottom: "5px"}}>

            <b>
                {name}
                <span className="bar_color_indicator" style={{
                    marginLeft: "4px",
                    display: "inline-block",
                    width: "15px",
                    height: "15px",
                    borderRadius: "10px",
                    backgroundColor: color
                }}/>
            </b>

            <InputWrapper propName={value} type="text" token={tokenAttribs}/>
            /
            <InputWrapper propName={max} type="text" token={tokenAttribs}/>

            {selectWidget}

        </div>

    )
};

const TokenPermission = ({name, tokenAttribs, propName}) => {
    const seeProp = `showplayers_${propName}`;
    const editProp = `playersedit_${propName}`;
    return (
        <div className="inlineinputs">

            <b style={{display: "inline-block", width: "60px"}}>{name}</b>

            <span style={{marginRight: "16px"}}>
                <InputWrapper defaultVal={false} propName={seeProp} type="checkbox" token={tokenAttribs}/>
                See
            </span>

            <span>
                <InputWrapper defaultVal={true} propName={editProp} type="checkbox" token={tokenAttribs}/>
                Edit
            </span>
        </div>
    )
};

const setTokenAttributeDataKey = (element: HTMLElement, value: string) => {
    element.setAttribute(tokenAttributeDataKey, value);
};

const tokenAttributeDataKey = "data-token-prop-name";

const InputWrapper = ({type, token, propName, defaultVal, ...otherProps}: any) => {
    const t: TokenAttributes = token;
    const widget = <input {...otherProps} type={type}/> as HTMLInputElement;

    setTokenAttributeDataKey(widget, propName);

    let valProp = null;
    let valDefault = null;

    switch (type) {
        case "checkbox":
            valProp = "checked";
            valDefault = false;
            break;
        case "number":
        case "color":
        case "text":
            valProp = "value";
            valDefault = "";
            break;
        default:
            console.error(`Unknown input type ${type}`);
    }

    if (valProp) {
        const tokenVal = t[propName];

        let val = typeof(tokenVal) === "undefined"
            ? (typeof(defaultVal) === "undefined" ? valDefault : defaultVal)
            : tokenVal;

        if(type === "number") {
            val = parseInt(val, 10) || 0;
        }

        widget[valProp] = val
    }

    return widget;
};

const ColorWidget = ({propName, token}) => {

    const input = <InputWrapper propName={propName} type="color" token={token}/> as HTMLInputElement;
    const onClick = (e: Event) => {
        e.stopPropagation();
        input.value = (e.target as any).value;
    };
    const button = <button onClick={onClick} value="transparent" className="btn">Clear</button>;

    setTokenAttributeDataKey(button, propName);

    return (
        <span style={{display: "inline-grid", gridTemplateColumns: "4fr 1fr"}}>
            {input}
            {button}
        </span>
    );
};

const LightSettings = ({tokenAttribs}) => {
    return (
        <div className="span6">

            <h4>Light Emitter</h4>

            <div className="inlineinputs" style="margin-bottom: 16px;">

                <InputWrapper propName="light_radius" type="text" token={tokenAttribs}/>
                ft.
                <InputWrapper propName="light_dimradius" type="text" token={tokenAttribs}/>
                ft.
                <InputWrapper propName="light_angle" type="text" token={tokenAttribs}/>

                <span style="font-size: 2.0em;">°</span>


                <div style="color: #888; padding-left: 5px; margin-bottom: 8px">
                    Light Radius / (optional) Start of Dim / Angle
                </div>

                <div style="margin-left: 7px;">
                    <InputWrapper propName="light_otherplayers" type="checkbox" style={{marginRight: "8px"}}
                                  token={tokenAttribs}/>
                    Is emitting light?
                </div>

            </div>

            <div style={{display: "grid", gridTemplateColumns: "auto auto"}}>

                <div>
                    <h4>Light Observer</h4>

                    <div className="inlineinputs" style="margin-bottom: 16px;">

                        <InputWrapper propName="light_losangle" type="text" placeholder="360"
                                      token={tokenAttribs}/>
                        <span style="font-size: 2.0em;">°</span>

                        <InputWrapper propName="light_multiplier" type="number" placeholder="1.0"
                                      token={tokenAttribs} style={{width: "40px", display: "inline-block", margin: "0px 5px"}}/>


                        <div style="color: #888; padding-left: 5px; margin-bottom: 8px">
                            Angle / Multiplier
                        </div>

                        <div style="margin-left: 7px;">
                            <InputWrapper propName="light_hassight" type="checkbox" style={{marginRight: "8px"}}
                                          token={tokenAttribs}/>
                            Can see?
                        </div>
                    </div>
                </div>

                <div>
                    <h4>Advanced Fog of War</h4>

                    <div className="inlineinputs" style="margin-top: 5px; margin-bottom: 16px;">
                        <InputWrapper propName="adv_fow_view_distance" type="text"
                                      token={tokenAttribs}/>
                        <div style="color: #888; padding-left: 5px;">View Distance</div>
                    </div>
                </div>
            </div>


        </div>
    )
};

class TabInstanceData {
    public token: TokenAttributes = null;
    public char: Character = null;
}

const DEFAULT_AVATAR_URL = "/images/character.png";

class CharacterTokenModifierModule extends R20Module.OnAppLoadBase {
    private sheetTab: SheetTab<TabInstanceData> = null;

    constructor() {
        super(__dirname);
    }

    private getUserData(instance: SheetTabSheetInstanceData<TabInstanceData>) {
        if (!instance.userData) instance.userData = new TabInstanceData();
        return instance.userData;
    }

    private onShowTab = (instance: SheetTabSheetInstanceData<TabInstanceData>) => {
        const data = this.getUserData(instance);
        console.log("show");


        if (data.token && data.char) return;

        data.char = instance.tryGetPc();
        console.log(data);

        if (!data.char) return;

        (R20.getBlob(data.char, "defaulttoken")
            .then((jsonToken) => {
                if(strIsNullOrEmpty(jsonToken)) {
                    // @ts-ignore
                    const tkn: TokenAttributes = {
                        imgsrc: data.char.attributes.avatar || DEFAULT_AVATAR_URL,
                        height: 70,
                        width: 70,
                        name: data.char.attributes.name,
                        represents: data.char.id,
                    };

                    data.token = tkn;
                } else {
                    data.token = JSON.parse(jsonToken);
                }
            }) as any)
            .finally(() => {
                instance.rerender();
            })
    };

    private renderWidget = (instance: SheetTabSheetInstanceData<TabInstanceData>) => {
        const campaign = R20.getCampaign().attributes;
        const data = this.getUserData(instance);

        if (!data.char) {
            return <div>
                "Could not find character."
            </div>
        }

        if (!data.token) {
            return (<div>
                Failed to get default token. You might not have permissions to do so.
            </div>);
        }

        const indentStyle = {
            marginTop: "16px",
            marginLeft: "16px"
        };

        const onChange = (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLInputElement;
            const attribName = target.getAttribute(tokenAttributeDataKey);
            if (!attribName) return;

            let val: any = target.value;

            switch (target.type) {
                case "checkbox": {
                    val = target.checked;
                    break;
                }
                case "number": {
                    val = parseInt(target.value, 10);
                }
            }

            console.log(`Change: ${attribName} -> ${val}`);
            data.token[attribName] = val;
        };

        const onRefresh = (e: Event) => {
            e.stopPropagation();

            if (confirm("You will lose any unsaved changes. Proceed?")) {
                data.char = null;
                data.token = null;
                this.onShowTab(instance);
            }
        };

        const onClickUpdateAllTokens = (e: Event) => {
            e.stopPropagation();
            if (!confirm("Are you sure you want to do this? " +
                "This will update ALL tokens in this campaign that represent this character." +
                "" +
                "If you have changed the avatar, a refresh is required to see the changes."))
                return;
            console.log(data.token);

            const pages = R20.getAllPages();
            for (const page of pages) {
                for (const token of page.thegraphics.models) {
                    if (!token.character) continue;
                    if (token.character.id !== data.char.id) continue;

                    token.save(data.token);
                }
            }
        };

        const onUpdateDefaultToken = () => {
            const rawToken = JSON.stringify(data.token);
            data.char.updateBlobs({
                defaulttoken: rawToken
            });

            data.char.save({
                defaulttoken: new Date().getTime()
            });
        };

        const setFromUrl = (e: Event) => {
            e.stopPropagation();
            const url = prompt("Image URL.", "www.example.com/image.png");
            if (!url) return;

            data.token.imgsrc = url;
            instance.rerender();
        };

        const removeAvatar = (e: Event) => {
            e.stopPropagation();
            data.token.imgsrc = DEFAULT_AVATAR_URL;
            instance.rerender();
        };

        const onExternalAvatarDrop = (e: DragEvent) => {
            let url = null;
            try {
                const data = e.dataTransfer.getData('text/html');
                // matches src="": 1st group is the inside of those quotes.
                const regex = /src="?([^"\s]+)"?\s*/;
                url = regex.exec(data)[1];
            } catch(err) {
                alert(`Drag & Drop image failed: ${err}`);
            }

            if(!url) return;

            data.token.imgsrc = url;
            instance.rerender();
        };

        const widget = (
            <div>
                <h3 style={{marginBottom: "16px"}}>Token Editor</h3>
                <div style={{borderBottom: "1px solid lightgray"}}/>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1.15fr"}}>
                    <div>

                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>

                            <div onDrop={onExternalAvatarDrop} className="r20es-token-img-hover" style={{margin: "16px", position: "relative"}}>

                                <div className="r20es-hover-block"
                                     style={{position: "absolute", bottom: "0", right: "0", left: "0", top: "0"}}>
                                    <button onClick={removeAvatar} className="btn" style={{marginBottom: "8px"}}>Remove
                                        Image
                                    </button>
                                    <button onClick={setFromUrl} className="btn">Set from URL</button>
                                </div>

                                <img src={data.token.imgsrc} alt="token image"/>

                            </div>

                            <div style={{marginRight: "16px"}}>
                                <div>Name</div>

                                <InputWrapper propName="name" type="text" style={{width: "210px"}}
                                              token={data.token}/>

                                <div>
                                    <InputWrapper propName="showname" type="checkbox"
                                                  style={{marginTop: "8px", marginRight: "4px"}}
                                                  token={data.token}/>
                                    <span>Show nameplate?</span>
                                </div>

                                <div>Tint Color</div>
                                <ColorWidget propName={"tint_color"} token={data.token}/>
                            </div>
                        </div>

                        <div>
                            <span style={{display: "inline-block", marginRight: "4px"}}>Width (px)</span>
                            <InputWrapper propName="width" style={{width: "48px", marginRight: "12px"}} type="number"
                                          token={data.token}/>

                            <span style={{display: "inline-block", marginRight: "4px"}}>Height (px)</span>
                            <InputWrapper propName="height" style={{width: "48px"}} type="number" token={data.token}/>

                        </div>

                        <hr/>

                        <LightSettings tokenAttribs={data.token}/>

                    </div>

                    <div style={{borderLeft: "1px solid lightgray"}}>
                        <div style={indentStyle}>
                            <BarEditor name="Bar 1" color={campaign.bar1_color} tokenAttribs={data.token}
                                       character={data.char} index={1}/>
                            <BarEditor name="Bar 2" color={campaign.bar2_color} tokenAttribs={data.token}
                                       character={data.char} index={2}/>
                            <BarEditor name="Bar 3" color={campaign.bar3_color} tokenAttribs={data.token}
                                       character={data.char} index={3}/>
                        </div>
                        <hr/>

                        <div style={indentStyle}>
                            <AuraEditor name="Aura 1" tokenAttribs={data.token} index={1}/>
                            <AuraEditor name="Aura 2" tokenAttribs={data.token} index={2}/>
                        </div>

                        <hr/>

                        <div style={indentStyle}>
                            <TokenPermission name="Name" propName="name"
                                             tokenAttribs={data.token}/>
                            <TokenPermission name="Bar 1" propName="bar1"
                                             tokenAttribs={data.token}/>
                            <TokenPermission name="Bar 2" propName="bar2"
                                             tokenAttribs={data.token}/>
                            <TokenPermission name="Bar 3" propName="bar3"
                                             tokenAttribs={data.token}/>
                            <TokenPermission name="Aura 1" propName="aura1"
                                             tokenAttribs={data.token}/>
                            <TokenPermission name="Aura 2" propName="aura2"
                                             tokenAttribs={data.token}/>
                        </div>

                    </div>
                </div>

                <span style="float: left">
                    <button onClick={onRefresh} className="btn btn-danger">Refresh</button>
                </span>

                <span style="float: right">
                    <button onClick={onClickUpdateAllTokens} style="margin-right: 8px" className="btn btn-info">Update all tokens</button>
                    <button onClick={onUpdateDefaultToken} className="btn btn-primary">Update default token</button>
                </span>
            </div>
        );

        $(widget).find("input, select, button").on("change", onChange).on("click", onChange);

        R20.setupImageDropTarget($(widget).find(".r20es-token-img-hover"),
            ({avatar}) => {
                console.log(avatar);
                data.token.imgsrc = avatar;
            },
            () => {
            /*
                Note(Justas): this callback is fired before the save callback is
                but we need the save cb to fire first so we just delay the redraw here.
             */

                setTimeout(() => {
                    console.log("rerender");
                    instance.rerender()
                }, 100);
            });

        return widget;
    };

    public setup = () => {
        this.sheetTab = SheetTab.add("Token Editor", this.renderWidget, this.onShowTab);
    };

    public dispose = () => {
        super.dispose();
        if (this.sheetTab) this.sheetTab.dispose();
    }
}

if (R20Module.canInstall()) new CharacterTokenModifierModule().install();
