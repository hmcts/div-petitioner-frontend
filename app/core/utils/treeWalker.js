/* eslint-disable no-use-before-define */

function walkMap(map = {}, functionToCallback, path = '', target = {}) {
  return Object.keys(map)
    .reduce((acc, key) => {
      acc[key] = interpret(map[key], functionToCallback, acc, path + key);
      return acc;
    }, target);
}

function interpret(value, functionToCallback, target, path) {
  if (Array.isArray(value)) {
    return walkArray(value, functionToCallback, path);
  } else if (typeof value === 'object') {
    return walkMap(value, functionToCallback, `${path}.`);
  }
  return functionToCallback(path, value);
}

function walkArray(array, functionToCallback, path, target = []) {
  Object.keys(array)
    .map(index => {
      return target.push(
        interpret(array[index], functionToCallback, target, `${path}[${index}]`)
      );
    });

  return target;
}

module.exports = walkMap;
