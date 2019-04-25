
function uppercaseAfterLetter(letter, str) {
  const splitStr = str.split(letter);
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0)
      .toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(letter);
}

const capitalizeName = str => {
  if (!str) {
    return null;
  }
  let result = str;
  result = result.charAt(0).toUpperCase() + result.slice(1);
  result = uppercaseAfterLetter(' ', result);
  result = uppercaseAfterLetter('-', result);
  result = uppercaseAfterLetter('\'', result);
  return result;
};

module.exports = capitalizeName;
