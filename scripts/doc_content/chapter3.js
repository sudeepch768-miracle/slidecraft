const { getChapter3_A } = require("./chapter3_a");
const { getChapter3_B } = require("./chapter3_b");
const { getChapter3_C } = require("./chapter3_c");
const { getChapter3_D } = require("./chapter3_d");
const { getChapter3_E } = require("./chapter3_e");
const { getChapter3_F } = require("./chapter3_f");

function createChapter3() {
  return [
    ...getChapter3_A(),
    ...getChapter3_B(),
    ...getChapter3_C(),
    ...getChapter3_D(),
    ...getChapter3_E(),
    ...getChapter3_F(),
  ];
}

module.exports = { createChapter3 };
