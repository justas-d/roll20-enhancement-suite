import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "hidePlayerList",
  name: `Hide Player List`,
  description: `Hides the player list.`,
  category: VTTES.Module_Category.canvas,
  gmOnly: false,

  config: {
    enabled: false
  }
};
