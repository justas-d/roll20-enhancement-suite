import React from "react";
import ReactDOM from "react-dom";
import 'main.css';
import 'index.css';


import chromeImg from 'chrome.png';
import ffImg from 'firefox.png';
import gitImg from 'github.png';


class NavBar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="/roll20-enhancement-suite">About</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/roll20-enhancement-suite/features">Features</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/roll20-enhancement-suite/contribute">Contribute</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="https://github.com/SSStormy/roll20-enhancement-suite">GitHub</a>
                    </li>
                </ul>
            </nav>
        )
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <div className="column-flex main-content">

                    <div className="column-flex top">

                        <div className="logo">
                            <img src="https://raw.githubusercontent.com/SSStormy/roll20-enhancement-suite/master/assets/logo.svg?sanitize=true" alt=""></img>
                        </div>

                        <div className="text-bg">
                            <h1 style={{ textAlign: "center" }}>Roll20 Enhancement Suite</h1>
                            <b>A quality of life and workflow extension for Roll20</b>

                            <div className="browser-icons">
                                <a href="https://addons.mozilla.org/en-US/firefox/addon/roll20-enhancement-suite/">
                                    <img src={ffImg} alt="" />
                                </a>

                                <a href="https://addons.mozilla.org/en-US/firefox/addon/roll20-enhancement-suite/">
                                    <img src={chromeImg} alt="" />
                                </a>

                                <a href="https://github.com/SSStormy/roll20-enhancement-suite">
                                    <img className="invert" src={gitImg} alt="" />
                                </a>
                            </div>

                            <NavBar />
                        </div>



                    </div>

                    { /* for maintaing a center on the h1*/ }
                    <div className="bottom">
                    </div>
                </div>
            </div >
        )
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

