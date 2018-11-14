import React from "react";
import ReactDOM from "react-dom";
import NavBar from 'NavBar.js';


function Index() {
    return (
        <div className="column-flex main-content">

            <div className="logo column-flex">
                <img src="logo.svg" alt=""></img>
            </div>

            <div className="text-bg">
                <h1 style={{textAlign: "center"}}>VTT Enhancement Suite</h1>

                <b>An unofficial quality of life and workflow extension for Roll20</b>

                <div>
                    <small>aka R20ES</small>
                </div>

                <div className="browser-icons">

                    <span className="background">
                        <a href="https://addons.mozilla.org/en-US/firefox/addon/roll20-enhancement-suite/">
                            <img src="firefox.png" alt=""/>
                        </a>

                        <a href="https://chrome.google.com/webstore/detail/roll20-enhancement-suite/fadcomaehamhdhekodcpiglabcjkepff">
                            <img src="chrome.png" alt=""/>
                        </a>

                        <a href="https://github.com/SSStormy/roll20-enhancement-suite">
                            <img className="invert" src="github.png" alt=""/>
                        </a>
                    </span>
                </div>

                <NavBar noLanding={true}/>
            </div>
        </div>
    )
}

if (typeof (window) !== "undefined" && window.document) {
    ReactDOM.render(<Index/>, document.getElementById("root"));
}

export default Index;
