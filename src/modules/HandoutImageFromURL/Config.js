import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
  id: "handoutImageFromUrl",
  name: "Set Hadnout Image from URL",
  description: "Allows you to set the handout image via a URL.",
  category: Category.misc,
  gmOnly: false,

  media: {
    "set_handout_image_from_url.png": "Set handout image from URL button.",
  },
});
