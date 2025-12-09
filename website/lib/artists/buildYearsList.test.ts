import { expect, test } from "vitest";
import { buildYearsList } from "./buildYearsList";

test("Build years list", () => {
  const fromYear = 1961;
  const toYear = 1965;

  const expectedYears: number[] = [1961, 1962, 1963, 1964, 1965];

  const years: number[] = buildYearsList(fromYear, toYear);

  expect(years).toEqual(expectedYears);
});

test("Build years list with single year", () => {
  const fromYear = 2000;
  const toYear = 2000;

  const expectedYears: number[] = [2000];

  const years: number[] = buildYearsList(fromYear, toYear);

  expect(years).toEqual(expectedYears);
});

test("Build years list with fromYear after toYear", () => {
  const fromYear = 2020;
  const toYear = 2015;

  const expectedYears: number[] = [ 2015, 2016, 2017, 2018, 2019, 2020 ];

  const years: number[] = buildYearsList(fromYear, toYear);

  expect(years).toEqual(expectedYears);
});
