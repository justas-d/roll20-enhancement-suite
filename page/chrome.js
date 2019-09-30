import React from 'react'
import ReactDOM from 'react-dom'

import NavBar from 'NavBar.js'
import {Config} from "../src/utils/Config";

function About() {

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
                    <li>1. Download the extension <a href="r20es_1.15.15_chrome.zip">here</a></li>
                    <li>2. Extract the zip file somewhere permanent.</li>
                    <li title="Chrome doesn't allow making hyperlinks to these special URLs :(">3. Copy & Paste <span style={{backgroundColor: "#ddd"}}>chrome://extensions</span> into the URL bar and press enter.</li>
                    <li>4. Enable "Developer Mode" in the top right.</li>
                    <li>5. Click "Load unpacked" in the top left.</li>
                    <li>6. Select the extracted extension folder and click the "Open"/"Select" button</li>
                    <li>7. Make sure to not delete the extension folder as that will remove the extension.</li>
                </ul>

            </div>
        </div>
    );
}

if(typeof(window) !== "undefined" && window.document) {
    ReactDOM.render(<About />, document.getElementById("root"));
}

export default About;















































