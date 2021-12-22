import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "handoutImageFromUrl",
  name: "Set Handout Image from URL",
  description: "Allows you to set the handout image via a URL.",
  category: VTTES.Module_Category.misc,
  gmOnly: false,

  media: {
    "set_handout_image_from_url.png": "Set handout image from URL button.",
  },
};
