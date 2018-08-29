import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from '../../tools/ConfigViews';

export default MakeConfig(__dirname, {
    id: "autoSortInitiative",
    name: "Automatically Sort Initiative",
    description: "Automatically sorts initiative order when a new token has been added to it by any player. After the list has been sorted, it is reorganized so that the token that was first in the list before the sort is still the first in the list after the sort.",
    category: Category.initiative,
    gmOnly: true,
    media: {
        "sort_init.webm": "Initiative being sorted automatically."
    },

    configView: {
        sortBy: {
            display: "Sort-By",
            type: ConfigViews.Dropdown,

            dropdownValues: {
                0: "Numerically: Ascending",
                1: "Numerically: Descending",
                2: "Alphabetically: A-Z",
                3: "Alphabetically: Z-A",
                card: "By Card/Suit"
            }
        }
    },

    config: {
       sortBy: 1
    },
});
