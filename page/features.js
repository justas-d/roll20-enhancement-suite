import React from 'react'
import ReactDOM from 'react-dom'

import Configs from '../src/Configs';
import NavBar from 'NavBar.js'

import 'main.css';
import 'more.css'
import 'features.css';

function FeatureCard(props) {
    const cfg = props.config;

    const media = [];

    if (cfg.media) {
        for (const url in cfg.media) {
            const widget = url.endsWith("webm")
                ? <video autoPlay loop src={url}></video>
                : <img src={url} alt={url} />

            media.push(<span key={url}>
                {widget}
                <p>{cfg.media[url]}</p>
            </span>);
        }
    }

    return (
        <div className="feature-card">
            <div className="left">
                <p>{cfg.description}</p>
            </div>

            {media.length > 0 &&
                <div className="right">
                    {media}
                </div>
            }
        </div>
    );
}

function Features() {
    const cards = [];
    for (const id in Configs) {
        const config = Configs[id];
        if (config.name && config.description) {
            cards.push(<div>
                <h2>{config.name}</h2>
                <FeatureCard key={id} config={config} />
                <hr />
            </div>);
        }
    }
    return (
        <div>
            <NavBar />

            <div className="container">
                <h1>Features</h1>
                <hr style={{ marginTop: "0" }} />

                {cards}
            </div>
        </div>
    );
}

ReactDOM.render(<Features />, document.getElementById("root"));
