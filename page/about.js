import React from 'react'
import ReactDOM from 'react-dom'

import NavBar from 'NavBar.js'
import GTag from 'GTag.js'
import {Config} from "../src/utils/Config.ts";

function About() {

    return (
        <div>
            <NavBar />

            <div className="container">
                <h1>About</h1>
                <hr style={{ marginTop: "0" }} />

                <ul>
                    <li>VTT Enhancement Suite (R20ES) is a browser extension usable on Firefox 57+ and Chrome made to enhance Roll20.</li>
                    <li>It is licensed under GPL-3.0 and the source code for it can be found on <a href="https://github.com/justas-d/roll20-enhancement-suite">GitHub</a>.</li>
                    <li>Currently maintained by <a style={{color: "#000a60"}}href="https://twitter.com/justas_dabrila">Justas</a></li>
                    <li>VTTES is community driven and is independent from and not affiliated with Roll20.</li>
                    <li>We have a <a href={Config.discordInvite}>Discord server.</a></li>
                </ul>

                <h2>The Thought Process</h2>

                <p>The main philosophy of VTTES is to provide free and open quality of life, workflow and general improvements to the Roll20 VTT. You can save hours of time by progamming for months. That's exactly why I want to share this with the world</p>

                <p>The primary and only goal of VTTES is to save people's time. Not only when preparing for games, but also when running them and playing in them. Roll20 is not perfect and I have had some repeating frusturating moments (why can't I select this darn token?). VTTES fixes the major quirks I've experienced.</p>

                <h2 id="privacy">Privacy</h2>
                <ul>
                    <li>The VTT Enhancement Suite does not collect any personally identifiable or otherwise any personal or campaign data.</li>
                    <li>Campaign data is accessed and used to allow The VTT Enhancement Suite to function during a session.</li>
                </ul>
            </div>

            <GTag/>
        </div>
    );
}

if(typeof(window) !== "undefined" && window.document) {
    ReactDOM.render(<About />, document.getElementById("root"));
}

export default About;

