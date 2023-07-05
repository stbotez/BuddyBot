exports.getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
};

async function getPageOfImageIndex(ind) {
  let page = 0;

  if (ind > 9) {
    page = ind - (ind % 10);
  }
  return page / 10;
}
