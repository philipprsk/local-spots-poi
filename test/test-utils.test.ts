import { assert } from "chai";

export function assertSubset(subset: any, superset: any): boolean {
  if (subset === null || subset === undefined) {
    assert.strictEqual(superset, subset);
    return true;
  }

  if (typeof subset !== "object" || subset instanceof Date) {
    assert.deepEqual(superset, subset);
    return true;
  }

  if (Array.isArray(subset)) {
    assert.isArray(superset);
    subset.forEach((item) => {
      assert.isTrue(superset.some((supersetItem : any) => assertSubset(item, supersetItem)));
    });
    return true;
  }

  // Objects
  Object.keys(subset).forEach((key) => {
    assert.property(superset, key, `Key ${key} not found in superset`);
    assertSubset(subset[key], superset[key]);
  });
  return true;
}