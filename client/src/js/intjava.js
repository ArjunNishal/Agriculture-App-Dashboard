// sidebarToggle.js
function toggleHtmlClass(className) {
  const htmlTag = document.querySelector("html");
  htmlTag.classList.toggle(className);
}

export { toggleHtmlClass };

export function removeHtmlClass(className) {
  if (document.documentElement.classList.contains(className)) {
    document.documentElement.classList.remove(className);
  }
}

export function closemodalimg() {
  const myButton = document.getElementById("closebtn_profile_img");
  myButton.click();
}
export function closemodalepisode() {
  const myButton = document.getElementById("editepisodemodalbtnclose");
  myButton.click();
}
