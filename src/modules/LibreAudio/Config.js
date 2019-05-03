import MakeConfig from '../MakeConfig';
import Category from '../Category';

export default MakeConfig(__dirname, {
    id: "libreAudio",
    name: "Libre Audio",
    description: "Allows creation and playback of tracks via their URL. Removes the 16 listener cap on My Audio Tracks. Refreshing the page is recommended after disabling/enabling this module in order to avoid issues.",
    category: Category.freedom,

    media: {
        "libre_audio.png": "Add by URL button",
    },

    mods: [
        /*
        { // play hook
            includes: "assets/app.js",
            find: `"My Audio"===r&&`,
            patch: `("My Audio" === r && window.r20es && window.r20es.canPlaySound && window.r20es.playSound && window.r20es.canPlaySound(n)) ? window.r20es.playSound(n) : "My Audio" === r &&`
        },
        { // play hook
            includes: "assets/app.js",
            find: `if("My Audio"===r){`,
            patch: `if(window.r20es && window.r20es.canPlaySound && window.r20es.playSound && window.r20es.canPlaySound(n)) { window.r20es.playSound(n) } else if("My Audio" === r) {`,
        },
        */
        {
            includes: "assets/app.js",
            find: `"/audio_library/play/"+campaign_id+"/"+o.split("-")[0],`,
            patch: `((window.r20es && window.r20es.canPlaySound && window.r20es.canPlaySound(i)) ? o : "/audio_library/play/"+campaign_id+"/"+o.split("-")[0]),`
        },
        {
            includes: "assets/app.js",
            find: `"/audio_library/play/"+campaign_id+"/"+o.split("-")[0]`,
            patch: `((window.r20es && window.r20es.canPlaySound && window.r20es.canPlaySound(i)) ? o : "/audio_library/play/"+campaign_id+"/"+o.split("-")[0])`
        },
        { // remove 16 player cap on my audio

            includes: "assets/app.js",
            find: `if(d20.Campaign.players.filter(function(e){return e.get("online")}).length>15)return t.stopAllTracks(),void(0===$("#myaudiocap").length&&($("#jukeboxwhatsplaying").after("<div id='myaudiocap' class='warning'>"+i18n("my_audio_cap","You've exceeded the maximum active game size for My Audio tracks. You may continue other audio track types. You can find more information on the <a href='https://wiki.roll20.net/Jukebox'>Roll20 Wiki</a>.")+"<span id='dismiss_myaudiocap' class='ui-icon ui-icon-closethick'>close</span></div>"),$("#dismiss_myaudiocap").on("click",function(){$("#myaudiocap").remove()})));`,
            patch: ``,
        },
    ]
});

