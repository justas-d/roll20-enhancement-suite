import MakeConfig from '../MakeConfig'; import Category from '../Category';

export default MakeConfig(__dirname, {
  id: "characterAvatarfromUrl",
  name: "Set Character Avatar from URL",
  description: "Allows you to set the character avatar image via a URL.",
  category: Category.misc,
  gmOnly: false,

  media: {
    "set_avatar_from_url.png": "Set avatar image from URL button.",
  },
});
