import React from 'react'
import ReactDOM from 'react-dom'

import NavBar from 'NavBar.js'
import GTag from 'GTag.js'
import {Config} from "../src/utils/Config.ts"

function Chrome() {
  return (
    <div>
      <NavBar />

        <div className="container">
          <h1>Userscript</h1>
          <hr style={{ marginTop: "0" }} />
          <p><b>VTTES is available as an easy to install, auto-updatable userscript.</b></p>
          <p><a href="https://www.patreon.com/posts/56585982">Patrons have full access to the userscript, as well as an installation guide.</a></p>

          <a href="https://www.patreon.com/bePatron?u=11619189" rel="noopener noreferrer">
            <img src="patreon.webp" alt="Become a Patron" style={{width: "217px", height: "51px"}}/>
          </a>

          <div style={{ marginTop: "32px" }} />

          <h2>Chrome Extension</h2>
          <hr style={{ marginTop: "0" }} />

          <p>As of 2019-09-30, the extension has been taken down from the Chrome Web Store in fear of copyright violation. The original takedown statement can be read <a href="takedown.png">here.</a></p>
          <p>Installing the extension is still possible but convoluted. We recommend using the Userscript or Firefox to avoid the extra steps.</p>

          <p><b>Beware that auto-updates will not be available while using this method.</b></p>

          <h3>Manual Installation Steps</h3>

          <ul>
            <li>1. <a href={`https://github.com/justas-d/roll20-enhancement-suite/raw/master/page/r20es_${LATEST_CHROME_VERSION}_chrome.zip`}>Download the extension here</a> ({`last updated on ${CHROME_LAST_UPDATE_TIME}, version ${LATEST_CHROME_VERSION})`}</li>
            <li>2. Extract the zip file somewhere permanent.</li>
            <li title="Chrome doesn't allow making hyperlinks to these special URLs :(">3. Copy & Paste <span style={{backgroundColor: "#ddd"}}>chrome://extensions</span> into the URL bar and press enter.</li>
            <li>4. Enable "Developer Mode" in the top right.</li>
            <li>5. Click "Load unpacked" in the top left.</li>
            <li>6. Select the extracted extension folder and click the "Open"/"Select" button</li>
            <li>7. Make sure to not delete the extension folder as that will remove the extension.</li>
          </ul>
        </div>

        <GTag/>
    </div>
  );
}

if(typeof(window) !== "undefined" && window.document) {
  ReactDOM.render(<Chrome/>, document.getElementById("root"));
}

export default Chrome;


