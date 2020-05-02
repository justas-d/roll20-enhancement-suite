import React from 'react'
import ReactDOM from 'react-dom'
import NavBar from 'NavBar.js'
import GTag from 'GTag.js'
import {Config} from "../src/utils/Config";

const Contribute = () => {

    return (
        <div>
          <NavBar/>

          <div className="container">
            <h1>Contributing</h1>
            <hr style={{marginTop: "0"}}/>

            <p>Maintaining the Suite via bug fixes and support requests costs us time. Recurring, and, single time, donations will directly fuel our efforts to respond quickly and keep up with any issues that crop up.</p>

            <h3>Methods</h3>
            <hr style={{marginTop: "0"}}/>

            <div style={{marginBottom: "32px"}}>
              <h4>PayPal.Me</h4>
              <div><b>Preferred due to no fees.</b></div>
              <div><i>Single</i></div>

              <div style={{margin: "16px"}}>
                <a href="https://www.paypal.me/JustasDabrila" target="_blank">
                  <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" alt="Donate with Paypal.Me"></img>
                </a>
              </div>
            </div>

            <div style={{marginBottom: "32px"}}>
              <h4>Buy Me A Coffee</h4>
              <div><b>You pay a fee.</b></div>
              <div><i>Single & Recurring</i></div>

              <div style={{margin: "16px"}}>
                <a href="https://www.buymeacoffee.com/stormy" target="_blank">
                  <img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style={{height: "51px", width: "217px"}}></img>
                </a>

              </div>
            </div>

            <div style={{marginBottom: "32px"}}>
              <h4>PayPal Donate</h4>
              <div><b>Least Preferred due to processing fees.</b></div>
              <div><i>Single & Recurring</i></div>

              <div style={{margin: "16px"}}>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                  <input type="hidden" name="cmd" value="_s-xclick" />
                  <input type="hidden" name="hosted_button_id" value="38S9JUTJSMVLN" />
                  <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                  <img alt="" border="0" src="https://www.paypal.com/en_LT/i/scr/pixel.gif" width="1" height="1" />
                </form>
              </div>
            </div>
          </div>

          <GTag/>
        </div>
    );
};

if (typeof(window) !== "undefined" && window.document) {
    ReactDOM.render(<Contribute/>, document.getElementById("root"));
}

export default Contribute;

