const newFilterInsertHyphen = input => {
  if (!input || (typeof input !== 'number' && typeof input !== 'string')) {
    return input;
  }
  return `${input}`.match(/.{1,4}/g).join(' &#8208; ');
};


const a11yCharSeparator = input => {
  if (typeof input === 'string') {
    // Regex replace to remove all excess whitespace (e.g. '  a      b ' -> 'ab')
    const returnString = input.replace(/\s+/g, '');
    // split each character of the no whitespace string and join with 1 whitespace character
    return returnString.split('').join(' ');
  }
  return input;
};

module.exports = {
  insertHyphens: newFilterInsertHyphen,
  a11yCharSeparator
};
