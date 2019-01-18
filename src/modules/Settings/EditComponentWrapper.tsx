import {DOM} from "../../utils/DOM";

const EditComponentWrapper = ({Component, cfgId, display, hook}) => {
    return (
        <li style={{ display: "flex", justifyContent: "flex-end" }}>

            <span style={{
                "margin-right": "8px",
                "border-right": "1px lightgray solid",
                "padding-right": "8px",
            }}
                  title={cfgId} className="text">{display}</span>

            <Component style={{width: "300px"}} configName={cfgId} hook={hook} />
        </li>
    );
};

export default EditComponentWrapper;

