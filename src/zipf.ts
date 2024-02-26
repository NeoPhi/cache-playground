import MersenneTwister from "mersenne-twister";
import zipfian from "zipfian-integer";
import { parseFloatFromEnv, parseIntFromEnv } from "./utilities";

const xMin = parseIntFromEnv("X_MIN", 1);
const xMax = parseIntFromEnv("X_MAX", 1000);
if (xMax <= xMin) {
  throw new Error(`xMin ${xMin} must be less than ${xMax}`);
}
const skew = parseFloatFromEnv("SKEW", 1.07);
const generator = new MersenneTwister(parseIntFromEnv("SEED", 42 * 237));
function random() {
  return generator.random();
}
const sample = zipfian(xMin, xMax, skew, random);
const iterations = parseIntFromEnv("ITERATIONS", 10000);

for (let index = 0; index < iterations; index += 1) {
  console.log(sample());
}
