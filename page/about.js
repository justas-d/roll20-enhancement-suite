import React from 'react'
import ReactDOM from 'react-dom'

import NavBar from 'NavBar.js'
import {Config} from "../src/utils/Config";

function About() {

    return (
        <div>
            <NavBar />

            <div className="container">
                <h1>About</h1>
                <hr style={{ marginTop: "0" }} />

                <p>VTT Enhancement Suite (R20ES) is a browser extention usable on Firefox 57+ and Chrome made to enhance Roll20. It is licensed under GPL-3.0 and the source code for it can be found on <a href="https://github.com/SSStormy/roll20-enhancement-suite">GitHub</a>. R20ES is community driven and is independant from and not affiliated with Roll20.</p>
                <p>We also have a <a href={Config.discordInvite}>Discord server!</a></p>

                <p>It started as something I threw together in the span of a weekend to fix some annoyances with Roll20 and quickly grew into a fully fledged browser plugin.</p>
                
                <h2>The Thought Process</h2>

                <p>The main philosophy of R20ES is to provide free and open quality of life, workflow and general improvements to the Roll20 VTT. You can save hours of time by progamming for months. That's exactly why I want to share this with the world</p>
 
                <p>The primary and only goal of R20ES is to save people's time. Not only when preparing for games, but also when running them and playing in them. Roll20 is not perfect and I have had some repeating frusturating moments (why can't I select this darn token?). R20ES fixes the major quirks I've experienced.</p>

                <h2>Privacy</h2>
                R20ES does not collect any of your private information, it does not track you etc or sell any kind of personal data.

            </div>
        </div>
    );
}

if(typeof(window) !== "undefined" && window.document) {
    ReactDOM.render(<About />, document.getElementById("root"));
}

export default About;

