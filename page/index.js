import React from "react";
import ReactDOM from "react-dom";
import GTag from 'GTag.js'
import NavBar from 'NavBar.js';

function Index() {
    return (
        <div className="column-flex main-content">

            <div className="logo column-flex">
                <img src="logo.svg" alt=""></img>
            </div>

            <div className="text-bg">
                <h1 style={{borderBottom: "2px solid gray", textAlign: "center"}}>VTT Enhancement Suite</h1>
                <b >An unofficial quality of life and workflow extension for Roll20</b>
                <div><b>By <a style={{color: "#000a60"}}href="https://twitter.com/justas_dabrila">Justas Dabrila</a></b></div>

                <div className="browser-icons">

                    <span className="background">
                        <a href="https://addons.mozilla.org/en-US/firefox/addon/roll20-enhancement-suite/">
                            <img src="firefox.png" alt=""/>
                        </a>

                        <a href="chrome.html">
                            <img src="chrome.png" alt=""/>
                        </a>

                        <a href="https://github.com/justas-d/roll20-enhancement-suite">
                            <img className="invert" src="github.png" alt=""/>
                        </a>
                    </span>
                </div>

                <NavBar noLanding={true}/>

                <a href="https://www.patreon.com/bePatron?u=11619189" rel="noopener noreferrer">
                  <img src="patreon.webp" alt="Become a Patron" style={{width: "217px", height: "51px"}}/>
                </a>
            </div>
          <GTag/>
        </div>
    )
}

if (typeof (window) !== "undefined" && window.document) {
    ReactDOM.render(<Index/>, document.getElementById("root"));
}

export default Index;
