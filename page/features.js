import React from 'react'
import ReactDOM from 'react-dom'

import {VTTES_MODULE_CONFIGS}from '../src/Configs';
import GTag from './GTag'
import NavBar from './NavBar'

function FeatureCard(props) {
    const cfg = props.config;

    const media = [];

    if (cfg.media) {
        for (const url in cfg.media) {
            const widget = url.endsWith("webm")
                ? <video autoPlay loop src={url}></video>
                : <img src={url} alt={url} />

            media.push(<span className="inner-card" key={url}>
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
  for(const id in VTTES_MODULE_CONFIGS) {
    const config = VTTES_MODULE_CONFIGS[id];
    if(config.name && config.description) {
      cards.push(<div>
        <h2 id={id}>{config.name}</h2>
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

      <GTag/>
    </div>
  );
}

if(typeof(window) !== "undefined" && window.document) {
  ReactDOM.render(<Features />, document.getElementById("root"));
}

export default Features
