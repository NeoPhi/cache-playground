import { parseIntFromEnv } from "./caches";
import MersenneTwister from "mersenne-twister";

const alpha = 1.27;
const xMin = 1;
const generator = new MersenneTwister(parseIntFromEnv("SEED", 42 * 237, true));

for (
  let index = 0;
  index < parseIntFromEnv("ITERATIONS", 10000, true);
  index += 1
) {
  console.log(
    Math.floor(
      (xMin - 0.5) * Math.pow(1 - generator.random(), -1 / (alpha - 1)) + 0.5
    )
  );
}
