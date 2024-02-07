import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import SayCallback = R20.SayCallback;
import {ADJUSTABLE_AUTMOMA_SPEED_CONFIG_KEY, GENERATE_VALUES_CONFIG_KEY, HEALTH_BAR_CONFIG_KEY} from "./Constants";
import { findByIdAndRemove } from "../../utils/MiscUtils";
import { DOM } from "../../utils/DOM";

class NPCAutomaModule extends R20Module.SimpleBase {
    static previousdataid = null;
    static cfg;
    private static readonly allyId = "window.r20es-ally-journal";
    private static readonly enemyId = "window.r20es-enemy-journal";
    constructor() {
        super(__dirname);
    }
    private static setPreviousDataId(id: String) {
        this.previousdataid = id;
    }
    private static getPreviousDataId() {
        return this.previousdataid;
    }

    private static play(data: Roll20.Token) {
        if(!data.id || data.id === NPCAutomaModule.getPreviousDataId()) return;
        NPCAutomaModule.setPreviousDataId(data.id);
        const obj = R20.getCurrentPageTokenByUUID(data.id);
        console.log("object");
        console.log(obj);
        let automaSpeed = 1000/NPCAutomaModule.cfg[ADJUSTABLE_AUTMOMA_SPEED_CONFIG_KEY];
        if (obj) {
            R20.selectToken(obj);
            let model = R20.try_get_canvas_object_model(obj);
            if (!model || model.get("layer") !== "objects") return;
            const attr = NPCAutomaModule.getCharacterAttributes(model.character);
            let secondModel = NPCAutomaModule.findClosestNeighbor(model);
            console.log("secondModel");
            console.log(secondModel);
            if (attr.npc  == "1") {
                NPCAutomaModule.moveNPC(model, action => {
                    if(NPCAutomaModule.checkNeighborTokens(model)) {
                        console.log("do damage");
                        NPCAutomaModule.doDamage(model, secondModel, (_,o) => {
                            NPCAutomaModule.advanceNPCInitiative(model, secondModel);
                        });
                    } else {
                        window.setTimeout(NPCAutomaModule.moveNPC,automaSpeed,model, nextturn => {
                            window.setTimeout(NPCAutomaModule.advanceNPCInitiative, automaSpeed, model, secondModel);
                        });
                    }
                });
            }
            return;
        }
    }
    

    private static advanceNPCInitiative (model: Roll20.Token,secondModel: Roll20.Token) {
        if (NPCAutomaModule.getCharacterAttributes(model.character).npc === "1" && NPCAutomaModule.getCharacterAttributes(secondModel.character).npc === "1" && NPCAutomaModule.cfg.autoNext) {
            R20.advanceInitiative();
        }
    }

    private static doDamage = async(model: Roll20.Token, secondModel: Roll20.Token, callback?: SayCallback) => {
        let npc_attacks = parseInt(NPCAutomaModule.getCharacterAttributes(model.character).npc_attacks);
        if (secondModel === null) {
            if(callback) callback(null,null);
            return;
        }
        R20.say("/em " + model.get("name") + " attacks " + secondModel.get("name"), R20.generateUUID(), (_,o) => {
            let ac = parseInt(NPCAutomaModule.getCharacterAttributes(secondModel.character).npc_ac);
            NPCAutomaModule.resolveRolls(model, secondModel,ac,npc_attacks, (_,o) => {
                if(callback) callback(null,null);
                return;
            });
        });
    }

    private static resolveRolls = async(model: Roll20.Token, secondModel: Roll20.Token, ac: number, npc_attacks: number, callback?: SayCallback) => {
        if (npc_attacks === 0) {
            if(callback) callback(null,null);
            return;
        }
        npc_attacks = npc_attacks - 1;
        let attackText = "%{selected|repeating_npcaction_$" + npc_attacks + "_npc_action}";
        console.log(attackText);
        let damage = 0;
        R20.say(attackText, R20.generateUUID(), (_,o) => {
            let targetname = secondModel.get("name");
            const healthBar = NPCAutomaModule.cfg[HEALTH_BAR_CONFIG_KEY];
            if (!o.hasOwnProperty("inlinerolls")) {
                R20.say(model.get("name") + "'s action did not result in a roll - not adjusting enemy hp. Review npc_attack attribute to confirm properly configure for multiattack.");
            } else if (o.inlinerolls.length < 6) {
                R20.say(model.get("name") + "'s action is not configured for automated attacks/damage");
            } else {
                const attack = o.inlinerolls[0].results.total;
                const crit = (o.inlinerolls[0].results.rolls[0].results[0].v === 20) && NPCAutomaModule.cfg.npcCrit;
                const critFail = (o.inlinerolls[0].results.rolls[0].results[0].v === 1) && NPCAutomaModule.cfg.npcCrit;
                damage = NPCAutomaModule.calcuateDamage(o,crit);
                if ((ac <= attack || crit) && !critFail && NPCAutomaModule.getCharacterAttributes(secondModel.character).npc === "1") {
                    R20.say(targetname + " took **" + damage + "** damage");
                    secondModel.attributes[healthBar] = secondModel.attributes[healthBar] - damage;
                    secondModel.save();
                }
            }
            if(secondModel.attributes[healthBar] <= 0 && damage > 0) {
                secondModel.destroy();
                R20.say("**" + model.get("name") + " has slain " + targetname + "!**");
                secondModel = NPCAutomaModule.findClosestNeighbor(model);
                if (npc_attacks > 0 && secondModel !== null) {
                    R20.say("/em " + model.get("name") + " attacks " + secondModel.get("name"), R20.generateUUID(), (_,o) => {
                        let ac = parseInt(NPCAutomaModule.getCharacterAttributes(secondModel.character).npc_ac);
                        NPCAutomaModule.resolveRolls(model, secondModel,ac,npc_attacks, (_,o) => {
                            if(callback) callback(null,null);
                            return;
                        });
                    });
                } else {
                    if(callback) callback(null,null);
                    return;
                }
            } else {
                NPCAutomaModule.resolveRolls(model, secondModel,ac,npc_attacks, (_,o) => {
                    if(callback) callback(null,null);
                    return;
                });
            }
        });
    }

    private static calcuateDamage(rollResponse, crit: boolean) {
        let damage;
        let damage1 = rollResponse.inlinerolls[2].results.total;
        let damage2 = rollResponse.inlinerolls[3].results.total;
        let damage3 = rollResponse.inlinerolls[4].results.total;
        let damage4 = rollResponse.inlinerolls[5].results.total;
        if (crit) {
            damage = damage1 + damage2 + damage3 + damage4;
            R20.say("**Critical Hit** for **" + damage + "** damage!!!!");
        } else {
            damage = damage1 + damage2;
        }
        return damage;
    }

    private static checkNeighborTokens (model: Roll20.Token) {
        const tokens = R20.getCurrentPageTokens();
        for (let obj of tokens) {
            let secondModel = R20.try_get_canvas_object_model(obj);
            if (!secondModel || secondModel.get("layer") !== "objects") continue;
            if (NPCAutomaModule.checkDistanceBetweenTokens(model, secondModel)) {
                return true;
            }
        }
        return false;
    }

    private static checkOpenSpace(left: Number, right: Number, top: Number, bottom: Number, model: Roll20.Token) {
        const tokens = R20.getCurrentPageTokens();
        let returnvalue = true;
        for (let obj of tokens) {
            let secondModel = R20.try_get_canvas_object_model(obj);
            if (!secondModel || secondModel.get("layer") !== "objects" || model === secondModel) continue;
            let xintersect = secondModel.attributes.left - secondModel.attributes.width/2 >= right || secondModel.attributes.left + secondModel.attributes.width/2 <= left;
            let yinetersect = secondModel.attributes.top - secondModel.attributes.height/2 >= bottom || secondModel.attributes.top + secondModel.attributes.height/2 <= top;
            if (!xintersect && !yinetersect) returnvalue = false;
        }
        return returnvalue;
    }

    private static findClosestNeighbor(model: Roll20.Token) {
        const tokens = R20.getCurrentPageTokens();
        let distance = 9001;
        let returnvalue = null;
        for (let obj of tokens) {
            let secondModel = R20.try_get_canvas_object_model(obj);
            if (!secondModel || secondModel.get("layer") !== "objects") continue;
            let dx = Math.abs(model.attributes.left + model.attributes.width/2 - secondModel.attributes.left - secondModel.attributes.width/2);
            let dy = Math.abs(model.attributes.top + model.attributes.height/2 - secondModel.attributes.top - secondModel.attributes.height/2);
            if (dx+dy <= distance && NPCAutomaModule.getCharacterAttributes(model.character).ally !== NPCAutomaModule.getCharacterAttributes(secondModel.character).ally) {
                distance = dx+dy;
                returnvalue = secondModel;
            }
        }
        return returnvalue;
    }

    private static moveNPC = async(model: Roll20.Token, callback?) => {
        let secondModel = NPCAutomaModule.findClosestNeighbor(model);
        if (!secondModel) {
            return;
        }
        let mleft = model.attributes.left;
        let width = model.attributes.width;
        let right = model.attributes.left+model.attributes.width/2;
        let mtop = model.attributes.top;
        let height = model.attributes.height;
        let bottom = model.attributes.top+model.attributes.height/2;
        let speed = parseInt(NPCAutomaModule.getCharacterAttributes(model.character).npc_speed)/5;
        let path;
        let startingplace = {mleft,mtop};
        while (speed > 0) {
            if (speed < 4) {
                path = NPCAutomaModule.findPath(mleft,mtop,width,height,speed,model,secondModel);
                speed = 0;
            } else {
                path = NPCAutomaModule.findPath(mleft,mtop,width,height,4,model,secondModel);
                mleft = path.mleft;
                mtop = path.mtop;
                speed = speed -4;
            }
            if ((startingplace.mleft !== path.mleft || startingplace.mtop !== path.mtop) && NPCAutomaModule.cfg.showMove){
                model.attributes.lastmove = startingplace.mleft + "," + startingplace.mtop + "," + startingplace.mleft + "," + startingplace.mtop;
            } else {
                model.attributes.lastmove = startingplace.mleft + "," + startingplace.mtop;
            }
            model.save({top:path.mtop,left:path.mleft});
        }
        if(callback) {
            callback(model);
        }
        return;
    }

    private static findPath(mleft: number, mtop: number, width: number, height: number, toMove: number, model: Roll20.Token, secondModel: Roll20.Token) {
        let left = mleft - width/2;
        let right = mleft + width/2;
        let top = mtop - height/2;
        let bottom = mtop + height/2;
        if (toMove === 0) {
            return {mleft,mtop};
        }
        let bestPath = {mleft,mtop};
        let leftPath = {mleft,mtop};
        let rightPath = {mleft,mtop};
        let upPath = {mleft,mtop};
        let downPath = {mleft,mtop};
        if(NPCAutomaModule.checkOpenSpace(left-70,right-70,top,bottom, model)) leftPath = NPCAutomaModule.findPath(mleft-70,mtop,width,height,toMove-1,model,secondModel);
        if(NPCAutomaModule.checkOpenSpace(left+70,right+70,top,bottom, model)) rightPath = NPCAutomaModule.findPath(mleft+70,mtop,width,height,toMove-1,model,secondModel);
        if(NPCAutomaModule.checkOpenSpace(left,right,top-70,bottom-70, model)) upPath = NPCAutomaModule.findPath(mleft,mtop-70,width,height,toMove-1,model,secondModel);
        if(NPCAutomaModule.checkOpenSpace(left,right,top+70,bottom+70, model)) downPath = NPCAutomaModule.findPath(mleft,mtop+70,width,height,toMove-1,model,secondModel);
        if(NPCAutomaModule.measureDistance(bestPath.mleft,bestPath.mtop,secondModel) > NPCAutomaModule.measureDistance(leftPath.mleft,leftPath.mtop,secondModel)) bestPath = leftPath;
        if(NPCAutomaModule.measureDistance(bestPath.mleft,bestPath.mtop,secondModel) > NPCAutomaModule.measureDistance(rightPath.mleft,rightPath.mtop,secondModel)) bestPath = rightPath;
        if(NPCAutomaModule.measureDistance(bestPath.mleft,bestPath.mtop,secondModel) > NPCAutomaModule.measureDistance(upPath.mleft,upPath.mtop,secondModel)) bestPath = upPath;
        if(NPCAutomaModule.measureDistance(bestPath.mleft,bestPath.mtop,secondModel) > NPCAutomaModule.measureDistance(downPath.mleft,downPath.mtop,secondModel)) bestPath = downPath;
        return bestPath;
    }

    private static measureDistance(mleft: number, mtop: number, secondModel: Roll20.Token) {
        return Math.sqrt((mleft - secondModel.attributes.left) * (mleft - secondModel.attributes.left) + (mtop - secondModel.attributes.top) * (mtop - secondModel.attributes.top));
    }

    private static checkDistanceBetweenTokens(model: Roll20.Token, secondModel: Roll20.Token) {
        if (NPCAutomaModule.getCharacterAttributes(model.character).ally !== NPCAutomaModule.getCharacterAttributes(secondModel.character).ally) {
            const value = (model.attributes.left - secondModel.attributes.left <= secondModel.attributes.width/2 + model.attributes.width/2) && (model.attributes.top - secondModel.attributes.top <= secondModel.attributes.height/2 + model.attributes.height/2 ) && (secondModel.attributes.left - model.attributes.left <= secondModel.attributes.width/2 + model.attributes.width/2) && (secondModel.attributes.top - model.attributes.top <= secondModel.attributes.height/2 + model.attributes.height/2);
            return value;
        }
        return false;
    }

    private static getCharacterAttributes(character: Roll20.Character) {
        let npc = null;
        let npc_ac = null;
        let ally = null;
        let npc_speed = null;
        let npc_attacks = null;
        let dtype = null;
        let rtype = null;
        if (character.attribs.models.length === 0) {
            R20.ensure_character_attributes_are_loaded(character);
        }
        for (let att of character.attribs.models) {
            if (att.attributes.name === "npc") {
                npc = att.attributes.current;
            } else if(att.attributes.name === "npc_ac") {
                npc_ac = att.attributes.current;
            } else if(att.attributes.name === "ally") {
                ally = att.attributes.current;
            } else if(att.attributes.name === "npc_speed") {
                npc_speed = att.attributes.current;
            } else if(att.attributes.name === "npc_attacks") {
                npc_attacks = att.attributes.current;
            } else if(att.attributes.name === "dtype") {
                dtype = att.attributes.current;
            } else if(att.attributes.name === "rtype") {
                rtype = att.attributes.current;
            }
        }
        return {npc, npc_ac, ally, npc_speed, npc_attacks, dtype, rtype};
    }

    private static setCharacterAttribute(character: Roll20.Character, attribute: string, value: string) {
        for (let att of character.attribs.models) {
            if (att.attributes.name === attribute) {
                att.save({current: value});
            }
        }
    }

    private static generateAllyAttributes(id: string) {
        NPCAutomaModule.generateAutomaAttributes(id, "1");
    }

    private static generateEnemyAttributes(id: string) {
        NPCAutomaModule.generateAutomaAttributes(id, "0");
    }

    private static generateAutomaAttributes(id: string, ally: string) {
        const char = R20.getCharacter(id);
        if (char) {
            let attributes = NPCAutomaModule.getCharacterAttributes(char);
            if (attributes.npc === null) char.attribs.create({name:"npc",current:"1"});
            NPCAutomaModule.setCharacterAttribute(char,"npc","1");
            if (attributes.npc_ac === null) char.attribs.create({name:"npc_ac",current:"10"});
            if (attributes.ally === null) char.attribs.create({name:"ally",current:ally});
            NPCAutomaModule.setCharacterAttribute(char,"ally",ally);
            if (attributes.npc_speed === null) char.attribs.create({name:"npc_speed",current:"30"});
            if (attributes.npc_attacks === null) char.attribs.create({name:"npc_attacks",current:"1"});
            if (attributes.dtype === null) char.attribs.create({name:"dtype",current:"full"});
            NPCAutomaModule.setCharacterAttribute(char,"dtype","full");
            if (attributes.dtype === null) char.attribs.create({name:"rtype",current:"{{always=1}} {{r2=[[@{d20}"});
            NPCAutomaModule.setCharacterAttribute(char,"rtype","{{always=1}} {{r2=[[@{d20}");
            NPCAutomaModule.updateAttack(char);
        }
    }

    private static updateAttack(character: Roll20.Character) {
        for (let att of character.attribs.models) {
            if (att.attributes.name.substring(0,20) === "repeating_npcaction_" && att.attributes.name.substring(40,50) === "_rollbase") {
                att.save({current: "@{wtype}&{template:npcfullatk} {{attack=1}} @{damage_flag} @{npc_name_flag} {{rname=@{name}}} {{r1=[[@{d20}+(@{attack_tohit}+0)]]}} @{rtype}+(@{attack_tohit}+0)]]}} {{dmg1=[[@{attack_damage}+0]]}} {{dmg1type=@{attack_damagetype}}} {{dmg2=[[@{attack_damage2}+0]]}} {{dmg2type=@{attack_damagetype2}}} {{crit1=[[@{attack_crit}+0]]}} {{crit2=[[@{attack_crit2}+0]]}} {{description=@{show_desc}}} @{charname_output}"});
            }
        }
    }

    private onSettingChange(name: string, oldVal: any, newVal: any) {
        if (name === GENERATE_VALUES_CONFIG_KEY) {
            let menu = document.getElementById("journalitemmenu");
            if (menu && NPCAutomaModule.cfg[GENERATE_VALUES_CONFIG_KEY]) {
                menu.firstElementChild.appendChild(
                    <li data-action-type="r20esmakeAlly" id={NPCAutomaModule .allyId}>
                        Make Ally
                    </li>
                );
                menu.firstElementChild.appendChild(
                    <li data-action-type="r20esmakeEnemy" id={NPCAutomaModule .enemyId}>
                        Make Enemy
                    </li>
                );
            } else if (!NPCAutomaModule.cfg[GENERATE_VALUES_CONFIG_KEY]) {
                findByIdAndRemove(NPCAutomaModule.allyId);
                findByIdAndRemove(NPCAutomaModule.enemyId);
            }
        }
    }


    public setup() {

        if(!R20.isGM()) return;
        NPCAutomaModule.cfg = this.getHook().config;

        let menu = document.getElementById("journalitemmenu");
        if (menu && NPCAutomaModule.cfg[GENERATE_VALUES_CONFIG_KEY]) {
            menu.firstElementChild.appendChild(
                <li data-action-type="r20esmakeAlly" id={NPCAutomaModule .allyId}>
                    Make Ally
                </li>
            );
            menu.firstElementChild.appendChild(
                <li data-action-type="r20esmakeEnemy" id={NPCAutomaModule .enemyId}>
                    Make Enemy
                </li>
            );
        }

        window.r20es.onJournalMakeAlly = NPCAutomaModule.generateAllyAttributes;
        window.r20es.onJournalMakeEnemy = NPCAutomaModule.generateEnemyAttributes;
        window.r20es.npcAutoma = NPCAutomaModule.play;
    }

    public dispose() {
        window.r20es.npcAutoma = null;
        findByIdAndRemove(NPCAutomaModule.allyId);
        findByIdAndRemove(NPCAutomaModule.enemyId);
    }
}

export default() => {
    new NPCAutomaModule().install();
};
