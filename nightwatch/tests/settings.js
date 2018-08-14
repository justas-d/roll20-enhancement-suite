const assert = require("assert");

module.exports = {
    'R20ES Settings button': function (b) {

        function openSettings() {
            b.click("[title='My Settings']");
            b.click(settingsButton);
            b.waitForElementVisible(settingsDialog, 1000);
        }

        b.globals.R20Init(b);
        const checkbox = ".r20es-settings-dialog .r20es-clickable-text input[type='checkbox']";
        const settingsButton = "#r20es-settings-button";
        const settingsDialog = ".r20es-settings-dialog";
        const settingsHeader = ".r20es-settings-dialog .dialog-header h2";
        const closeButton = ".r20es-settings-dialog .dialog-footer-content [value='Close']"

        openSettings();
        b.assert.containsText(settingsHeader, "Roll20 Enhancement Suite Settings");

        // unselect checkboxes
        b.elements("css selector", checkbox, obj => {
            let i = 0;
            for (const el of obj.value) {
                const id = b.globals.getElementId(el);

                b.elementIdSelected(id, rez => {
                    assert.strictEqual(rez.value, true);
                });

                if (i++ % 2 === 0) {
                    b.elementIdClick(id);

                    b.elementIdSelected(id, rez => {
                        assert.strictEqual(rez.value, false);
                    });
                }
            }
        });

        // close and open
        b.click(closeButton);
        b.click(settingsButton);
        b.waitForElementVisible(settingsDialog, 1000);

        // verify checkbox state
        b.elements("css selector", checkbox, obj => {
            let i = 0;
            for (const el of obj.value) {
                const expectedState = !(i++ % 2 === 0);

                const id = b.globals.getElementId(el);
                b.elementIdSelected(id, rez => {
                    assert.strictEqual(rez.value, expectedState);
                });
            }
        });

        b.refresh();
        b.globals.R20WaitForAppLoad(b);

        openSettings();

        // select checkboxes
        b.elements("css selector", checkbox, obj => {
            let i = 0;
            for (const el of obj.value) {
                const expectedState = !(i++ % 2 === 0);

                const id = b.globals.getElementId(el);
                b.elementIdSelected(id, rez => {
                    assert.strictEqual(rez.value, expectedState);
                });

                // only click checkboxes that are unchecked.
                if (!expectedState) {
                    b.elementIdClick(id);

                    b.elementIdSelected(id, rez => {
                        assert.strictEqual(rez.value, !expectedState);
                    });
                }
            }
        });

        b.click(closeButton);
    }
};
