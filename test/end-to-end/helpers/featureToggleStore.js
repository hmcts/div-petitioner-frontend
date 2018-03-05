let toggles = {};

function setToggle(toggle, value) {
  toggles[toggle] = value;
}

function getToggle(toggle) {
  return toggles[toggle];
}

module.exports = { setToggle, getToggle };