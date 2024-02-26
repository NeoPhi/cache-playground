import MersenneTwister from "mersenne-twister";
import { parseFloatFromEnv, parseIntFromEnv } from "./utilities";

const xMin = parseIntFromEnv("X_MIN", 5);
const alpha = parseFloatFromEnv("ALPHA", 2.5);
const generator = new MersenneTwister(parseIntFromEnv("SEED", 42 * 237));
const iterations = parseIntFromEnv("ITERATIONS", 10000);

for (let index = 0; index < iterations; index += 1) {
  // Based on D.6 from http://arXiv.org/abs/0706.1062v2
  console.log(
    Math.floor(
      (xMin - 0.5) * Math.pow(1 - generator.random(), -1 / (alpha - 1)) + 0.5
    )
  );
}
