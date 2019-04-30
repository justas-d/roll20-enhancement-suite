import React from 'react'
import ReactDOM from 'react-dom'
import NavBar from 'NavBar.js'
import {Config} from "../src/utils/Config";

const Contribute = () => {

    return (
        <div>
            <NavBar/>

            <div className="container">
                <h1>Contributing</h1>
                <hr style={{marginTop: "0"}}/>

                <p>VTT Enhancement Suite is free and open source. Consider buying me a coffee so I can continue working on it.</p>

                <h3>Donation Methods I pay a fee on</h3>

                <div style={{display: "flex"}}>
                <div style={{margin: "8px"}}>
                    <h4>BMC</h4>
                <style>{`.bmc-button
                    img{width: 27px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{line - height: 36px !important;height:37px !important;text-decoration: none !important;display:inline-flex !important;color:#FFFFFF !important;background-color:#FF813F !important;border-radius: 3px !important;border: 1px solid transparent !important;padding: 1px 9px !important;font-size: 23px !important;letter-spacing: 0.6px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Cookie', cursive !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;-o-transition: 0.3s all linear !important;-webkit-transition: 0.3s all linear !important;-moz-transition: 0.3s all linear !important;-ms-transition: 0.3s all linear !important;transition: 0.3s all linear !important;}.bmc-button:hover,
                    .bmc-button:active,
                    .bmc-button:focus {-webkit - box - shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#FFFFFF !important;}
                    `}
                </style>

                <link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet"/>
                <a className="bmc-button"
                   target="_blank"
                   href="https://www.buymeacoffee.com/stormy">
                    <img
                        src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a coffee"/>
                    <span style={{marginLeft: "5px"}}>Buy me a coffee</span>
                </a>
                </div>

                <div style={{margin: "8px"}}>
                    <h4>Paypal</h4>
                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                        <input type="hidden" name="cmd" value="_s-xclick" />
                        <input type="hidden" name="hosted_button_id" value="38S9JUTJSMVLN" />
                        <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                        <img alt="" border="0" src="https://www.paypal.com/en_LT/i/scr/pixel.gif" width="1" height="1" />
                    </form>

                </div>
                </div>
            </div>
        </div>
    );
};

if (typeof(window) !== "undefined" && window.document) {
    ReactDOM.render(<Contribute/>, document.getElementById("root"));
}

export default Contribute;

