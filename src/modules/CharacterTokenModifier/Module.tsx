import {R20Module} from '../../tools/R20Module'
import {DOM, DOM} from '../../tools/DOM'
import {SheetTab} from '../../tools/SheetTab';
import {R20} from "../../tools/R20";
import {Character, Token, TokenAttributes} from 'roll20';
import getBlob = R20.getBlob;

const AuraEditor = ({name}) => {
    return (
        <div className="inlineinputs" style={{marginTop: "5px"}}>
            <b>{name}</b>

            <input className="aura1_radius" type="text"/>

            <span style={{marginRight: "16px"}}>
            ft.
            </span>

            <span style={{marginRight: "16px"}}>
                <input type="color"/>
            </span>

            <span>
                <input className="aura1_square" type="checkbox"/>
                Square
            </span>
        </div>
    );
};

const BarEditor = ({name, color, _char}) => {
    const char: Character = _char;

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

            <input className="bar1_value" type="text"/>
            /
            <input className="bar1_max" type="text"/>


            <select className="bar1_link" style={{width: "125px;"}}>
                <option value="">None</option>
                {char.attribs.map(a => <option value={a.id}>{a.attributes.name}</option>)}
            </select>

        </div>

    )
};

const TokenPermission = ({name}) => {
    return (
        <div className="inlineinputs">

            <b style={{display: "inline-block", width: "60px"}}>{name}</b>

            <span style={{marginRight: "16px"}}>
                <input className="showplayers_name" type="checkbox"/>
                See
            </span>

            <span>
                <input className="playersedit_name" type="checkbox"/>
                Edit
            </span>
        </div>
    )
};

const LightSettings = ({}) => {
    return (
        <div className="span6">

            <h4>Light Emitter</h4>

            <div className="inlineinputs" style="margin-bottom: 16px;">


                <input className="light_radius" type="text"/>
                ft.
                <input className="light_dimradius" type="text"/>
                ft.
                <input className="light_angle" placeholder="360" type="text"/>

                <span style="font-size: 2.0em;">°</span>


                <div style="color: #888; padding-left: 5px; margin-bottom: 8px">
                    Light Radius / (optional) Start of Dim / Angle
                </div>

                <div style="margin-left: 7px;">
                    <input className="light_otherplayers" type="checkbox" style={{marginRight: "8px"}}/>
                    Visible by observers?
                </div>

            </div>

            <div style={{display: "grid", gridTemplateColumns: "auto auto"}}>

                <div>
                    <h4>Light Observer</h4>

                    <div className="inlineinputs" style="margin-bottom: 16px;">

                        <input className="light_losangle" placeholder="360" type="text"/>
                        <span style="font-size: 2.0em;">
                    °
                </span>

                        <input className="light_multiplier" placeholder="1.0" style="margin-right: 10px;" type="text"/>


                        <div style="color: #888; padding-left: 5px; margin-bottom: 8px">
                            Angle / Multiplier
                        </div>

                        <div style="margin-left: 7px;">
                            <input className="light_hassight" type="checkbox" style={{marginRight: "8px"}}/>
                            Can see?
                        </div>
                    </div>
                </div>

                <div>
                    <h4>Advanced Fog of War</h4>

                    <div className="inlineinputs" style="margin-top: 5px; margin-bottom: 16px;">
                        <input className="advfow_viewdistance" type="text"/> ft.
                        <div style="color: #888; padding-left: 5px;">View Distance</div>
                    </div>
                </div>
            </div>


        </div>
    )
};

class CharacterTokenModifierModule extends R20Module.OnAppLoadBase {
    private sheetTab: SheetTab = null;
    private token: TokenAttributes = null;
    private char: Character = null;

    constructor() {
        super(__dirname);
    }

    private onShowTab = () => {
        this.token = null;
        this.char = this.sheetTab.tryGetPc();

        if (!this.char) return;

        (R20.getBlob(this.char, "defaulttoken")
            .then((jsonToken) => {
                this.token = JSON.parse(jsonToken);
            }) as any)
            .finally(() => {
                DOM.rerender(this.sheetTab.root, this.renderWidget);

            })
    };

    private renderWidget = () => {
        const campaign = R20.getCampaign().attributes;

        if (!this.char) {
            return <div>
                "Could not find character."
            </div>
        }

        if (!this.token) {
            return (<div>
                "Failed to get default token. You might not have permissions to do so.
            </div>);
        }

        const indentStyle = {
            marginTop: "16px",
            marginLeft: "16px"
        };

        return (

            <div>
                <h3 style={{marginBottom: "16px"}}>Token Editor</h3>
                <div style={{borderBottom: "1px solid lightgray"}}/>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1.15fr"}}>
                    <div>

                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>

                            <div style={{padding: "8px"}}>
                                <img src={this.token.imgsrc} alt="token image"/>
                            </div>

                            <div style={{marginRight: "16px"}}>
                                <div>Name</div>
                                <input className="name" style={{width: "210px"}} type="text"/>

                                <input style={{marginTop: "8px", marginRight: "4px"}} type="checkbox"/>
                                <span>Show nameplate?</span>

                                <div>Tint Color</div>
                                <input type="color"/>
                            </div>
                        </div>

                        <hr/>

                        <LightSettings/>

                    </div>

                    <div style={{borderLeft: "1px solid lightgray"}}>
                        <div style={indentStyle}>
                            <BarEditor name="Bar 1" color={campaign.bar1_color} _char={this.char}/>
                            <BarEditor name="Bar 2" color={campaign.bar2_color} _char={this.char}/>
                            <BarEditor name="Bar 3" color={campaign.bar3_color} _char={this.char}/>
                        </div>
                        <hr/>

                        <div style={indentStyle}>
                            <AuraEditor name="Aura 1"/>
                            <AuraEditor name="Aura 2"/>
                        </div>

                        <hr/>

                        <div style={indentStyle}>
                            <TokenPermission name="Name"/>
                            <TokenPermission name="Bar 1"/>
                            <TokenPermission name="Bar 2"/>
                            <TokenPermission name="Bar 3"/>
                            <TokenPermission name="Aura 1"/>
                            <TokenPermission name="Aura 2"/>
                        </div>

                    </div>
                </div>

                <span style="float: right">
                    <button className="btn" style="margin-right: 8px">Update default token</button>
                    <button className="btn">Update all tokens</button>
                </span>
            </div>
        );
    };

    // <div className="clear" style={{height: "10px"}}></div>

    public setup = () => {
        this.sheetTab = SheetTab.add("Token Editor", this.renderWidget, this.onShowTab);
    };

    public dispose = () => {
        super.dispose();
        if (this.sheetTab) this.sheetTab.dispose();
    }
}

if (R20Module.canInstall()) new CharacterTokenModifierModule().install();
