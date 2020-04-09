import React from 'react'
import ReactDOM from 'react-dom'

import NavBar from 'NavBar.js'
import {Config} from "../src/utils/Config";

function Chrome() {

    return (
        <div>
            <NavBar />

            <div className="container">
                <h1>Chrome</h1>
                <hr style={{ marginTop: "0" }} />

                <p>As of 2019-09-30, the extension has been taken down from the Chrome Web Store in fear of copyright violation.</p>
                <p>The original takedown statement can be read <a href="takedown.png">here</a></p>
                <p>Installing the extension is still possible but convoluted.</p>
                <p>We recommend using Firefox to avoid the extra steps.</p>

                <ul>
                    <li>1. <a href="https://github.com/SSStormy/roll20-enhancement-suite/raw/gh-pages/r20es_1.15.24_chrome.zip">Download the extension here</a> (last updated on 2020-04-09, version 1.15.24)</li>
                    <li>2. Extract the zip file somewhere permanent.</li>
                    <li title="Chrome doesn't allow making hyperlinks to these special URLs :(">3. Copy & Paste <span style={{backgroundColor: "#ddd"}}>chrome://extensions</span> into the URL bar and press enter.</li>
                    <li>4. Enable "Developer Mode" in the top right.</li>
                    <li>5. Click "Load unpacked" in the top left.</li>
                    <li>6. Select the extracted extension folder and click the "Open"/"Select" button</li>
                    <li>7. Make sure to not delete the extension folder as that will remove the extension.</li>
                </ul>

                <p>Beware that auto-updates will not be available while using this method.</p>

            </div>
        </div>
    );
}

if(typeof(window) !== "undefined" && window.document) {
    ReactDOM.render(<Chrome/>, document.getElementById("root"));
}

export default Chrome;















































