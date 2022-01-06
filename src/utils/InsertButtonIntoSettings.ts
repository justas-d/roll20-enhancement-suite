export const insertButtonIntoSettings = (button: HTMLElement) => {
  const root = document.getElementById("settings-accordion");
  root.insertBefore(button, root.firstElementChild);
};


