import React from 'react'
import ReactDOM from 'react-dom'

import NavBar from 'NavBar.js'

import 'main.css';
import 'more.css'


function Contribute() {

    return (
        <div>
            <NavBar />

            <div className="container">
                <h1>Contribute</h1>

            </div>
        </div>
    );
}

ReactDOM.render(<Contribute />, document.getElementById("root"));
