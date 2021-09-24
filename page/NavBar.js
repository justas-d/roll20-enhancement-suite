import React from "react";
import {Config} from "../src/utils/Config.ts";

const NavBar = ({noLanding = false}) => {
  let classes = "navbar navbar-expand-lg navbar-light "
  if(!noLanding) {
    classes = classes + "navbar-landing"
  }
    return (
        <nav className={classes}>
          <ul className="navbar-nav">

            {!noLanding &&
            <li className="nav-item">
                <a className="nav-link" href={`${R20ES_PAGE_PREFIX}/`}>Landing</a>
            </li>
            }

            <li className="nav-item">
                <a className="nav-link" href={`${R20ES_PAGE_PREFIX}/features.html`}>Features</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href={`${R20ES_PAGE_PREFIX}/about.html`}>About</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href={`https://justas-d.github.io/coffee.html`}>Contribute</a>
            </li>
          </ul>
        </nav>
    )
}

export default NavBar;
