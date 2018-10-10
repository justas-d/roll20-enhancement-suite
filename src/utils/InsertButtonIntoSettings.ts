export const insertButtonIntoSettings = (button: HTMLElement) => {
    const adjacent = document.getElementById("exitroll20game");
    adjacent.parentNode.parentNode.insertBefore(button, adjacent.parentNode);
};


