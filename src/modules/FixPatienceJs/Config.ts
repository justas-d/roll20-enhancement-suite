import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "fixPatienceJs",
  name: "fixPatienceJs",
  description: "",
  category: VTTES.Module_Category.misc,
  force: true,

  // NOTE(justasd): 
  // patience.js straight up appends to the <head> of the document with innerHTML += ... and that
  // seems to force the browser to re-interpret a bunch of styling for the page, causing flickering
  // during load and, sometimes, style issues (page toolbar icon disappearing, the canvas being all
  // the way to the left of the screen etc). So this fixes all that crap.
  // 2021-09-23
  mods: [
    {
      includes: "patience.js",

      find_replace: [
        {
          find: `document.querySelectorAll('head')[0]`,
          replace: `document.body`,
        },

        {
          find: `</style>`,
          replace: ``,
        },

        {
          find: `<style id="patience__styles" type="text/css" media="screen">`,
          replace: ``,
        },

        {
          find: `patinetHeader.innerHTML += patientStyles;`,
          replace: 
          `{
            const el = document.createElement("style");
            el.id = 'patience__styles';
            el.type = 'text/css';
            el.media = 'screen';
            el.innerText = patientStyles;
            patinetHeader.appendChild(el);
          }`
        },
      ],
    },
  ],
};
