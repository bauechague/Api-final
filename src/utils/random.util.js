export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem(array) {
  return array[randomInt(0, array.length - 1)];
}

export function randomSuffix(length = 5) {
  return Math.random().toString(36).slice(2, 2 + length);
}
