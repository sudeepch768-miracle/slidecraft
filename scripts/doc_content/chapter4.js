const { getChapter4_A } = require("./chapter4_a");
const { getChapter4_B } = require("./chapter4_b");

function createChapter4() {
  return [
    ...getChapter4_A(),
    ...getChapter4_B(),
  ];
}

module.exports = { createChapter4 };
