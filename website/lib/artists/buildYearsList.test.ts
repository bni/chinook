import { expect, test } from "vitest";
import { buildYearsList } from "./buildYearsList";

test("Build years list", () => {
  const fromYear = 1961;
  const toYear = 1965;

  const expectedYears: number[] = [1961, 1962, 1963, 1964, 1965];

  const years: number[] = buildYearsList(fromYear, toYear);

  expect(years).toEqual(expectedYears);
});
