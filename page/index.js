import React from "react";
import ReactDOM from "react-dom";
import 'main.css';
import 'index.css';

import chromeImg from 'chrome.png';
import ffImg from 'firefox.png';
import gitImg from 'github.png';

import NavBar from 'NavBar.js';
import logoSvg from '../assets/logo.svg'

function Index() {
    return (
        <div>
            <div className="column-flex main-content">

                <div className="column-flex top">

                    <div className="logo">
                        <img src={logoSvg} alt=""></img>
                    </div>

                    <div className="text-bg">
                        <h1 style={{ textAlign: "center" }}>Roll20 Enhancement Suite</h1>
                        <b>A quality of life and workflow extension for Roll20</b>

                        <div className="browser-icons">
                            <a href="https://addons.mozilla.org/en-US/firefox/addon/roll20-enhancement-suite/">
                                <img src={ffImg} alt="" />
                            </a>

                            <a href="https://chrome.google.com/webstore/detail/roll20-enhancement-suite/fadcomaehamhdhekodcpiglabcjkepff">
                                <img src={chromeImg} alt="" />
                            </a>

                            <a href="https://github.com/SSStormy/roll20-enhancement-suite">
                                <img className="invert" src={gitImg} alt="" />
                            </a>
                        </div>

                        <NavBar />
                    </div>
                </div>

                { /* for maintaing a center on the h1*/}
                <div className="bottom">
                </div>
            </div>
        </div >
    )
}

ReactDOM.render(<Index />, document.getElementById("root"));
