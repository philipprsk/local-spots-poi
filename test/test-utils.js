import { assert } from "chai";

export function assertSubset(expected, actual) {
  Object.keys(expected).forEach((key) => {
    assert.deepEqual(
      actual[key],
      expected[key],
      `Mismatch for key '${key}'`
    );
  });
}