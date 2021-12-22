import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoSortInitiative",
  name: "Automatically Sort Initiative",
  description: "Automatically sorts initiative order when a new token has been added to it by any player. After the list has been sorted, it is reorganized so that the token that was first in the list before the sort is still the first in the list after the sort.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  media: {
    "sort_init.webm": "Initiative being sorted automatically."
  },

  configView: {
    sortBy: {
      display: "Sort-By",
      type: VTTES.Config_View_Type.Dropdown,

      dropdownValues: {
        0: "Numerically: Ascending",
        1: "Numerically: Descending",
        2: "Alphabetically: A-Z",
        3: "Alphabetically: Z-A",
        card: "By Card/Suit"
      }
    },

    respectFirstTokenPosition: {
      display: "Respect the position of the current token in the order",
      type: VTTES.Config_View_Type.Checkbox
    },
  },

  config: {
    sortBy: 1,
    respectFirstTokenPosition: true
  },
};
