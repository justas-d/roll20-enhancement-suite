import {R20Module} from '../../tools/R20Module'
import {DOM} from '../../tools/DOM'
import {SheetTab} from '../../tools/SheetTab';
import {R20} from "../../tools/R20";
import {Character} from 'roll20';

const AuraEditor = ({name}) => {
    return (
        <div>
            <label>
                {name}
            </label>

            <div className="inlineinputs" style={{marginTop: "5px"}}>


                <label>
                    <input className="aura1_square" type="checkbox"/>
                    Square
                </label>
                <input className="aura1_radius" type="text"/>
                ft.


                <input className="aura1_color colorpicker" style={{display: "none"}} type="text"/>

                <div>
                    <input type="color"/>
                </div>
            </div>
        </div>
    );
};

const BarEditor = ({name, color, _char}) => {
    const char: Character = _char;

    return (
        <div>
            <label>
                <span className="bar_color_indicator" style={{marginRight: "4px", display: "inline-block", width: "15px", height:"15px", borderRadius: "10px", backgroundColor: color}}></span>
                {name}
            </label>

            <div className="clear" style={{height: "1px"}}>

            </div>

            <div className="inlineinputs" style={{marginTop: "5px", marginBottom: "5px"}}>
                <input className="bar1_value" type="text"/>
                /
                <input className="bar1_max" type="text"/>


                <select className="bar1_link" style={{width: "125px;"}}>
                    <option value="">None</option>
                    {char.attribs.map(a => {
                        <option value={a.id}>{a.attributes.name}</option>
                    })}
                </select>

            </div>

            <div className="clear">

            </div>
        </div>
    )
};

class CharacterTokenModifierModule extends R20Module.OnAppLoadBase {
    private sheetTab: SheetTab = null;

    constructor() {
        super(__dirname);
    }

    private renderWidget = () => {
        const campaign = R20.getCampaign().attributes;
        const char = this.sheetTab.tryGetPc();
        if(!char) {
            return <div>
                "Could not find character."
            </div>
        }

        return (
            <div>

                <BarEditor name="Bar 1" color={campaign.bar1_color} _char={char}/>
                <BarEditor name="Bar 2" color={campaign.bar2_color} _char={char}/>
                <BarEditor name="Bar 3" color={campaign.bar3_color} _char={char}/>


                <div className="clear" style={{height: "10px"}}></div>


                <AuraEditor name="Bar 1"/>
                <AuraEditor name="Bar 2"/>

            </div>
        );
    };

    public setup = () => {
        this.sheetTab = SheetTab.add("Token Editor", this.renderWidget);
    };

    public dispose = () => {
        super.dispose();
        if (this.sheetTab) this.sheetTab.dispose();
    }
}

if (R20Module.canInstall()) new CharacterTokenModifierModule().install();
