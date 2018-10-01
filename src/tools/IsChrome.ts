import { detect as detectBrowser } from "detect-browser";

export default () => {
    return detectBrowser().name === "chrome";
};