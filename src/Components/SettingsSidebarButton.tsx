import {DOM} from "../utils/DOM";

const SettingsSidebarButton = ({text, ...props}) => {
    return (
        <input
            type="button"
            style={{marginBottom: "8px", width: "calc(100% - 21px)"}}
            className="btn"
            value={text}
            {...props}
        />
    );
};

export { SettingsSidebarButton }
