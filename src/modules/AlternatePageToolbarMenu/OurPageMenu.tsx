import {DOM} from "../../utils/DOM";
import {DialogBase} from "../../utils/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../utils/DialogComponents";
import {R20} from "../../utils/R20";
import {PageAttributes, Page} from "roll20";
import lexCompare from "../../utils/LexicographicalComparator";

export default class OurPageMenu extends DialogBase<null> {

    public constructor() {
        super(undefined, {width: "80%", maxWidth: "unset", maxHeight: "unset", height: "90%"});
    }

    public show() {
        super.internalShow();
    }

    category_shown_state: {[name: string]: boolean} = {};
    is_first_render =  true;

    is_category_shown = (name: string): boolean  => {
        return !!this.category_shown_state[name];
    };

    protected render() {
        const pages = R20.getAllPages();
        const page_widgets = [];
        const thumb_size = 32;
        const icon_size = 16;

        interface Category {
            name: string;
            pages: Page[];
        }

        const category_table: {[id: string]: Category} = {};

        for(const page_obj of pages) {
            const page = page_obj.attributes;
            const matches = /\[(.*?)\]/g.exec(page.name);

            const push_to_category = (name: string) => {
                if (!category_table[name]) {
                    category_table[name] = {
                        name: name,
                        pages: []
                    }
                }
                category_table[name].pages.push(page_obj);
            };

            if(matches && matches.length == 2) {
                const match = matches[1];
                push_to_category(match);
            }
            else {
                push_to_category("None");
            }
        }

        const categories: Category[] = [];
        let none_category: Category;
        for(const key in category_table) {
            const val = category_table[key];
            if(key === "None") {
                none_category = val
            }else {
                categories.push(val);
            }
        }
        categories.sort((a, b) => lexCompare(a, b, (d) => d.name));
        if(none_category) {
            categories.push(none_category);
        }

        for(const category of categories) {

            if(this.is_first_render) {
                this.category_shown_state[category.name] = true;
            }

            const toggle_category = () => {
                this.category_shown_state[category.name] = !this.is_category_shown(category.name);
                this.rerender();
            };

            page_widgets.push(<div>
                <h1 onClick={toggle_category}>{category.name}</h1>
            </div>);

            if(!this.is_category_shown(category.name)) {
                continue;
            }

            for (const page_obj of category.pages) {
                const page = page_obj.attributes as PageAttributes;
                let img_widget;
                const img_style = {
                    display: "inline",
                    height: `${thumb_size}px`,
                    width: `${thumb_size}px`,
                    maxHeight: `${thumb_size}px`,
                    maxWidth: `${thumb_size}px`,
                    marginRight: "4px"
                };

                const icon_style = {
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: `${icon_size}px`,
                    width: `${icon_size}px`,
                    marginRight: "4px"
                };

                if (!page.thumbnail) {
                    img_widget = <span style={{...img_style, backgroundColor: "red"}}/>
                }
                else {
                    img_widget = <img style={img_style} src={page.thumbnail}/>;
                }

                page_widgets.push(
                    <div>
                        {img_widget}
                        <div style={icon_style}><span className="pictos duplicate">;</span></div>
                        <div style={icon_style}><span className="pictos settings">y</span></div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>{page.name || "Untitled"}</div>
                    </div>
                );
            }
        }
        
        this.is_first_render = false;

        return (
            <div style={{margin: "16px"}}>
                {page_widgets}
            </div>
        );
    }
}
