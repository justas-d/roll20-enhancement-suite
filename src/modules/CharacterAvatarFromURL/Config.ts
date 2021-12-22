import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "characterAvatarfromUrl",
  name: "Set Character Avatar from URL",
  description: "Allows you to set the character avatar image via a URL.",
  category: VTTES.Module_Category.misc,
  gmOnly: false,

  media: {
    "set_avatar_from_url.png": "Set avatar image from URL button.",
  },
};
