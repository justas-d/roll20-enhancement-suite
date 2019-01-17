import { R20Module } from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import {PageAttributes, FirebaseReference, PathTokenAttributes, TextTokenAttributes, Page, ObjectStorage, SyncObject} from 'roll20';
import {R20} from "../../utils/R20";

interface MapObj {
    page_id: string,
    controlledby: string
}

class DisablePlayerDrawings extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }

    _shouldIgnoreEvents = false;


    handleObjectPlacement = (data: FirebaseReference<MapObj>, dataPoolGetter: (page: Page) => ObjectStorage<SyncObject<MapObj>>) => {
        if(this._shouldIgnoreEvents) {
            return;
        }

        var attribs = data.val();

        const page = R20.getPageById(attribs.page_id);

        if(!page) {
            this.reportThatWeDontHaveThePageObject();
            return;
        }

        const object = dataPoolGetter(page).get(data.key());
        if(!object) {
            this.reportThatWeDontHaveTheInnerPageObject();
            return;
        }

        if(!this.canPlaceObjects(object.attributes.controlledby)) {
            object.destroy();
        }
    };

    canPlaceObjects = (playerId: string) => {
        return playerId != "-LUNfvQAJY-BzHfFV0Ch";
    };

    onTextAdded = (firebaseObject: FirebaseReference<TextTokenAttributes>) => {
        this.handleObjectPlacement(firebaseObject, (page) => page.thetexts);
    };

    onDrawingAdded = (firebaseObject: FirebaseReference<PathTokenAttributes>) => {
        this.handleObjectPlacement(firebaseObject, (page) => page.thepaths);
    };

    unhookPage = (page: Page) => {
        page.thepaths.backboneFirebase.reference.off("child_added", this.onDrawingAdded);
        page.thetexts.backboneFirebase.reference.off("child_added", this.onTextAdded);
    };

    reportThatWeDontHaveTheInnerPageObject = () => {
        console.error(`[DisablePlayerDrawings] find inner page object after receiving firebase event!`);
    }

    reportThatWeDontHaveThePageObject = () => {
        console.error("[DisablePlayerDrawings] onPageAdded failed to find wrapped page object after receiving firebase event!");
    };

    onPageAdded = (firebaseObject: FirebaseReference<PageAttributes>) => {
        const page = R20.getPageById(firebaseObject.key());

        if(!page) {
            this.reportThatWeDontHaveThePageObject();
            return;
        }

        page.thepaths.backboneFirebase.reference.on("child_added", this.onDrawingAdded);
        page.thetexts.backboneFirebase.reference.on("child_added", this.onTextAdded);
    };

    onPageRemoved = (firebaseObject: FirebaseReference<PageAttributes>) => {
        const page = R20.getPageById(firebaseObject.key());

        if(!page) {
            this.reportThatWeDontHaveThePageObject();
            return;
        }

        this.unhookPage(page);
    };

    public setup = () => {
        if(!R20.isGM()) {
            return;
        }

        /*
            Note(justas):
                firebase's on("child_added") fires the callback for each initial value and each new value.
                Since we only want onTextAdded & onDrawingAdded to be called when there are new respective
                objects added to the page, this functionality is not useful to us.

                According to the firebase docs (https://www.firebase.com/docs/web/api/query/on.html)
                there's no way around this (thanks, google).
                So we have to resort to a @HACK and ignore events for the first second after init.
         */

        this._shouldIgnoreEvents = true;

        window.Campaign.pages.backboneFirebase.reference.on("child_added", this.onPageAdded);
        window.Campaign.pages.backboneFirebase.reference.on("child_removed", this.onPageRemoved);

        setTimeout(() => {
            this._shouldIgnoreEvents = false;
        }, 1000);
    };

    public dispose = () => {
        super.dispose();

        if(!R20.isGM()) {
            return;
        }

        for(const page of R20.getAllPages()) {
            this.unhookPage(page);
        }

        window.Campaign.pages.backboneFirebase.reference.off("child_added", this.onPageAdded);
        window.Campaign.pages.backboneFirebase.reference.off("child_removed", this.onPageRemoved);
    }
}

if (R20Module.canInstall()) new DisablePlayerDrawings().install();
