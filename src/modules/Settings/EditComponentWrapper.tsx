import {DOM} from "../../utils/DOM";

const EditComponentWrapper = ({Component, cfgId, display, hook}) => {
    return (
        <li style={{ display: "flex", justifyContent: "space-between" }}>
            <span title={cfgId} className="text">{display}</span>
            <Component configName={cfgId} hook={hook} />
        </li>
    );
};

export default EditComponentWrapper;

