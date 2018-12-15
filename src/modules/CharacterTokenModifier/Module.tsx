import {R20Module} from '../../utils/R20Module'
import {DOM} from '../../utils/DOM'
import {SheetTab, SheetTabSheetInstanceData} from '../../utils/SheetTab';
import {R20} from "../../utils/R20";
import {Character, CharacterSheetAttribute, TokenAttributes} from 'roll20';
import {strIsNullOrEmpty} from "../../utils/MiscUtils";
import lexCompare from "../../utils/LexicographicalComparator";
import {isChromium} from "../../utils/BrowserDetection";
import {Optional} from "../../utils/TypescriptUtils";

const InputCheckbox = ({defaultVal = undefined, propName, token, label, wrapperStyle = {}}) => {
    return (
        <span style={{display: "inline-flex", alignItems: "center", ...wrapperStyle}}>
            <InputWrapper defaultVal={defaultVal} style={{marginRight: "4px"}} propName={propName} type="checkbox" token={token}/>
            <span>{label}</span>
        </span>
    )
};

const AuraEditor = ({tokenAttribs, name, index}) => {
    const radius = `aura${index}_radius`;
    const color = `aura${index}_color`;
    const square = `aura${index}_square`;

    return (
        <div className="inlineinputs" style={{display: "flex", alignItems: "center", marginTop: "5px"}}>
            <b>{name}</b>

            <InputWrapper propName={radius} type="text" token={tokenAttribs}/>

            <span style={{marginRight: "16px"}}>
            ft.
            </span>


            <span style={{marginRight: "16px"}}>
                <ColorWidget propName={color} token={tokenAttribs}/>
            </span>

            <InputCheckbox label="Square" propName={square} token={tokenAttribs}/>
        </div>
    );
};

const BarEditor = ({name, color, character, tokenAttribs, index, onChange}) => {
    const char: Character = character;
    const value = `bar${index}_value`;
    const max = `bar${index}_max`;
    const link = `bar${index}_link`;

    const EDIT_WIDGET_TITLE = "You can only edit the current and max values when the bar is not linked.";

    const currentWidget = (
        <InputWrapper title={EDIT_WIDGET_TITLE} propName={value} type="text" token={tokenAttribs}/>
    ) as HTMLInputElement;

    const maxWidget = (
        <InputWrapper title={EDIT_WIDGET_TITLE} propName={max} type="text" token={tokenAttribs}/>
    ) as HTMLInputElement;

    let linkId = tokenAttribs[link];

    const updateBarValues = (id: Optional<string>) => {

        const attrib = char.attribs.get(id);

        if (!id || !attrib) {

            currentWidget.disabled = false;
            maxWidget.disabled = false;

            searchWidget.value = "";
            setOverrideTokenData(searchWidget, "");
            return;
        }

        currentWidget.disabled = true;
        maxWidget.disabled = true;

        linkId = id;

        searchWidget.value = attrib.attributes.name;

        setOverrideTokenData(searchWidget, attrib.id);

        currentWidget.value = attrib.attributes.current;
        maxWidget.value = attrib.attributes.max;

        onChange({target: currentWidget});
        onChange({target: maxWidget});
    };

    const searchWidget = (
        <input type="text" style={{flex: "1"}} placeholder="Search for attribute"/>
    );

    const attribAutocompleteData = char.attribs.models
        .sort((a: CharacterSheetAttribute, b: CharacterSheetAttribute) => lexCompare(a, b, (d: CharacterSheetAttribute) => d.attributes.name))
        .map((a) => {
            return {
                value: a.id,
                label: a.attributes.name,
            }
        });

    // @ts-ignore
    $(searchWidget).autocomplete({
        minLength: 1,
        delay: 0,
        source: attribAutocompleteData,
        change: (e, ui) => {
            const val = (ui && ui.item && ui.item.value) || undefined;
            updateBarValues(val);
        },
        focus: (e, ui) => {
            e.preventDefault();
            updateBarValues(ui.item.value);
        },
        select: (e, ui) => {
            e.preventDefault();
            updateBarValues(ui.item.value);
        }
    });

    $(searchWidget).blur(() => {
        if(searchWidget.value.trim() === "") {
            updateBarValues(undefined);
        }
    });

    $(searchWidget).change(() => {
        if(searchWidget.value.trim() === "") {
            updateBarValues(undefined);
        }
    });

    setTokenAttributeDataKey(searchWidget, link);
    updateBarValues(linkId);

    return (
        <div className="inlineinputs" style={{marginTop: "5px", marginBottom: "5px", display: "flex", alignItems: "center"}}>

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

            {searchWidget}
            {currentWidget}
            /
            {maxWidget}
        </div>

    )
};

const TokenPermission = ({name, tokenAttribs, propName}) => {
    const seeProp = `showplayers_${propName}`;
    const editProp = `playersedit_${propName}`;

    return (
        <div className="inlineinputs" style={{display: "flex", alignItems: "center"}}>
            <b style={{display: "inline-block", width: "60px"}}>{name}</b>

            <InputCheckbox label="See" defaultVal={false} propName={seeProp} token={tokenAttribs} wrapperStyle={{marginRight: "16px"}}/>
            <InputCheckbox label="Edit" defaultVal={true} propName={editProp} token={tokenAttribs}/>
        </div>
    )
};

const setTokenAttributeDataKey = (element: HTMLElement, value: string) => {
    element.setAttribute(tokenAttributeDataKey, value);
};

const tokenAttributeValueOverrideDataKey = "data-token-value-override";

const setOverrideTokenData = (element: HTMLElement, value: string) => {
    element.setAttribute(tokenAttributeValueOverrideDataKey, value);
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

        let val: any = null;
        if (typeof(tokenVal) === "undefined") {
            val = typeof(defaultVal) === "undefined"
                ? valDefault
                : defaultVal;
        } else {
            val = tokenVal;
        }

        if (type === "number") {
            val = parseInt(val, 10) || 0;
        }

        widget[valProp] = val
    }

    return widget;
};

const ColorWidget = ({propName, token}: any) => {

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
                                      token={tokenAttribs}
                                      style={{width: "40px", display: "inline-block", margin: "0px 5px"}}/>


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
                if (strIsNullOrEmpty(jsonToken)) {
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
                    const defaultToken: TokenAttributes = JSON.parse(jsonToken);

                    // @ts-ignore
                    data.token = {
                        represents: defaultToken.represents,
                        name: defaultToken.name,
                        imgsrc: defaultToken.imgsrc,
                        showname: defaultToken.showname,
                        tint_color: defaultToken.tint_color,
                        width: defaultToken.width,
                        height: defaultToken.height,
                        light_radius: defaultToken.light_radius,
                        light_dimradius: defaultToken.light_dimradius,
                        light_angle: defaultToken.light_angle,
                        light_otherplayers: defaultToken.light_otherplayers,
                        light_losangle: defaultToken.light_losangle,
                        light_multiplier: defaultToken.light_multiplier,
                        light_hassight: defaultToken.light_hassight,
                        adv_fow_view_distance: defaultToken.adv_fow_view_distance,

                        bar1_link: defaultToken.bar1_link,
                        bar1_max: defaultToken.bar1_max,
                        bar1_value: defaultToken.bar1_value,

                        bar2_link: defaultToken.bar2_link,
                        bar2_max: defaultToken.bar2_max,
                        bar2_value: defaultToken.bar2_value,

                        bar3_link: defaultToken.bar3_link,
                        bar3_max: defaultToken.bar3_max,
                        bar3_value: defaultToken.bar3_value,

                        aura1_color: defaultToken.aura1_color,
                        aura1_radius: defaultToken.aura1_radius,
                        aura1_square: defaultToken.aura1_square,

                        aura2_color: defaultToken.aura2_color,
                        aura2_radius: defaultToken.aura2_radius,
                        aura2_square: defaultToken.aura2_square,

                        showplayers_name: defaultToken.showplayers_name,
                        playersedit_name: defaultToken.playersedit_name,

                        showplayers_bar1: defaultToken.showplayers_bar1,
                        playersedit_bar1: defaultToken.playersedit_bar1,

                        showplayers_bar2: defaultToken.showplayers_bar2,
                        playersedit_bar2: defaultToken.playersedit_bar2,

                        showplayers_bar3: defaultToken.showplayers_bar3,
                        playersedit_bar3: defaultToken.playersedit_bar3,

                        showplayers_aura1: defaultToken.showplayers_aura1,
                        playersedit_aura1: defaultToken.playersedit_aura1,

                        showplayers_aura2: defaultToken.showplayers_aura2,
                        playersedit_aura2: defaultToken.playersedit_aura2,
                    };

                    for(const key in data.token) {
                        if(data.token[key] === undefined || data.token[key] === null) {
                            delete data.token[key];
                        }
                    }
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
                Could not find character. You might not have permissions to do so.
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

        const onChange = (e: any) => {
            if (e.stopPropagation) e.stopPropagation();

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

            const overrideValue = target.getAttribute(tokenAttributeValueOverrideDataKey);

            if (overrideValue) {
                val = overrideValue;
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

            beginWork();
            const pages = R20.getAllPages();
            for (const page of pages) {
                // Note(Justas): sometimes this is undefined. I cannot repro this at all.
                if(!page.thegraphics) continue;

                for (const token of page.thegraphics.models) {
                    if (!token.character) continue;
                    if (token.character.id !== data.char.id) continue;

                    token.save(data.token);
                }
            }
            endWork();
        };

        const onUpdateDefaultToken = () => {
            beginWork();
            const modifiedToken = {
                ...data.token
            };

            if(modifiedToken.bar1_link) {
                delete modifiedToken.bar1_value;
            }

            if(modifiedToken.bar2_link) {
                delete modifiedToken.bar2_value;
            }

            if(modifiedToken.bar3_link) {
                delete modifiedToken.bar3_value;
            }

            const rawToken = JSON.stringify(modifiedToken);

            console.log(modifiedToken);

            data.char.updateBlobs({
                defaulttoken: rawToken
            });

            data.char.save({
                defaulttoken: new Date().getTime()
            });
            endWork();
        };

        const setFromUrl = (e: Event) => {
            e.stopPropagation();
            const url = prompt("Image URL.", "www.example.com/image.png");
            if (!url) return;

            data.token.imgsrc = url;
            instance.rerender();
        };

        const setCharacterName = (e: Event) => {
            beginWork();
            data.char.save({
                name: data.token.name
            });

            const npcNameAttrib = data.char.attribs.find(a => a.attributes.name === "npc_name");
            if(npcNameAttrib) {
                npcNameAttrib.save({
                    current:  data.token.name
                });
            }
            endWork()
        };

        const removeAvatar = (e: Event) => {
            e.stopPropagation();
            data.token.imgsrc = DEFAULT_AVATAR_URL;
            instance.rerender();
        };

        const onExternalAvatarDrop = (e: DragEvent) => {
            let url = undefined;
            let error = null;

            try {
                const data = e.dataTransfer.getData('text/html');
                // matches src="": 1st group is the inside of those quotes.
                const regex = /src="?([^"\s]+)"?\s*/;
                url = regex.exec(data)[1];

            } catch (err) {
                error = err;
            }

            if(url === null || url === undefined) {
                // @ts-ignore
                url = e.url;
            }

            if (!url) {
                alert(`Drag & Drop image failed: ${error}`);
                return;
            }

            data.token.imgsrc = url;
            instance.rerender();
        };

        const refreshButton = (
            <button onClick={onRefresh} className="btn">Refresh</button>
        ) as HTMLInputElement;
        const updateDefaultTokenButton = (
            <button onClick={onUpdateDefaultToken} className="btn">Update default token</button>
        ) as HTMLInputElement;

        const progressWidget = (
            <span style={{marginLeft: "auto", marginRight: "auto"}}>
            </span>
        ) as HTMLSpanElement;

        const beginWork = () => {
            progressWidget.innerText = "Saving...";
        };

        const endWork = () => {
            progressWidget.innerText = "Done!";
        };

        if (!R20.isGM()) {
            const addTooltip = (elem: HTMLElement) => {
                // Note(Justas): tipsy on FF has this neat HTML tooltip that gets disabled when live is set to true.
                // However, that tooltip doesn't work on Chrome unless live is set to true.
                // So we set live to true if we're on Chrome.
                // @ts-ignore
                $(elem).tipsy({
                    live: isChromium(),
                });
            };

            updateDefaultTokenButton.title = "Players do not have permission to update the default token but they can update already placed tokens. Try updating all tokens.";
            updateDefaultTokenButton.disabled = true;
            addTooltip(updateDefaultTokenButton);

            refreshButton.title = "Players do not have permissions to read default character tokens.";
            refreshButton.disabled = true;
            addTooltip(refreshButton);

        } else {
            updateDefaultTokenButton.classList.add("btn-primary");
            refreshButton.classList.add("btn-danger");
        }

        const borderString = "1px solid lightgray";

        const widget = (
            <div>
                <h3 style={{marginBottom: "16px"}}>Token Editor</h3>
                <div style={{borderBottom: borderString}}/>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                    <div style={{borderBottom: borderString}}>

                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>

                            <div onDrop={onExternalAvatarDrop} className="r20es-token-img-hover"
                                 style={{margin: "16px", position: "relative"}}>

                                <div className="r20es-hover-block"
                                     style={{position: "absolute", bottom: "0", right: "0", left: "0", top: "0"}}>
                                    <button onClick={removeAvatar} className="btn" style={{marginBottom: "8px"}}>Remove
                                        Image
                                    </button>

                                    <button style={{marginBottom: "8px"}} onClick={setFromUrl} className="btn">Set from
                                        URL
                                    </button>

                                    <div style={{backgroundColor: "rgba(255,255,255,0.5)"}}>Drag an image on me!</div>
                                </div>

                                <img style={{width: "100%"}}src={data.token.imgsrc} alt="token image"/>

                            </div>

                            <div style={{marginRight: "16px"}}>
                                <div>Name</div>

                                <div style={{display: "flex"}}>
                                    <InputWrapper propName="name" type="text" style={{width: "210px"}} token={data.token}/>
                                    <button onClick={setCharacterName} className="btn" title="Updates the name of the character on the sheet with the name in the input box.">Set</button>
                                </div>

                                <div>
                                    <InputWrapper propName="showname" type="checkbox"
                                                  style={{marginTop: "8px", marginRight: "4px"}}
                                                  token={data.token}/>
                                    <span>Show nameplate?</span>
                                </div>

                                <div>Tint Color</div>
                                <ColorWidget style={{marginBottom: "8px"}} propName={"tint_color"} token={data.token}/>
                            </div>
                        </div>

                        <div style={{marginBottom: "4px"}}>
                            <span style={{display: "inline-block", marginRight: "4px"}}>Width (px)</span>
                            <InputWrapper propName="width" style={{width: "48px", marginRight: "12px"}} type="number"
                                          token={data.token}/>

                            <span style={{display: "inline-block", marginRight: "4px"}}>Height (px)</span>
                            <InputWrapper propName="height" style={{width: "48px"}} type="number" token={data.token}/>

                        </div>

                        <div style={{marginBottom: "4px"}}>
                            <span style={{display: "inline-block", marginRight: "4px"}}>Rotation (angles)</span>
                            <InputWrapper propName="rotation" type="number" token={data.token}/>
                        </div>


                        <div>
                            <InputCheckbox label="Flip Horizontal" defaultVal={false} propName={"fliph"} token={data.token} wrapperStyle={{marginRight: "16px"}}/>
                            <InputCheckbox label="Flip Vertical" defaultVal={false} propName={"flipv"} token={data.token}/>
                        </div>

                        <hr/>

                        <LightSettings tokenAttribs={data.token}/>

                    </div>

                    <div style={{borderBottom: borderString, borderLeft: borderString}}>
                        <div style={indentStyle}>
                            <BarEditor name="Bar 1" color={campaign.bar1_color} tokenAttribs={data.token}
                                       character={data.char} onChange={onChange} index={1}/>
                            <BarEditor name="Bar 2" color={campaign.bar2_color} tokenAttribs={data.token}
                                       character={data.char} onChange={onChange} index={2}/>
                            <BarEditor name="Bar 3" color={campaign.bar3_color} tokenAttribs={data.token}
                                       character={data.char} onChange={onChange} index={3}/>
                        </div>
                        <hr/>

                        <div style={indentStyle}>
                            <AuraEditor name="Aura 1" tokenAttribs={data.token} index={1}/>
                            <AuraEditor name="Aura 2" tokenAttribs={data.token} index={2}/>
                        </div>

                        <hr/>

                        <div style={Object.assign({}, indentStyle, {marginBottom: "16px"})}>
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

                <div style={{marginTop: "16px", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>

                    <span style="float: left">
                        {refreshButton}
                    </span>

                    {progressWidget}

                    <span style="float: right">
                        <button onClick={onClickUpdateAllTokens} style="margin-right: 8px" className="btn btn-info">Update all tokens</button>
                        {updateDefaultTokenButton}
                    </span>
                </div>
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
