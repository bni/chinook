import { RangeSlider } from "@mantine/core";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

const MIN_YEAR = 1940;
const MAX_YEAR = 2030;
const STEPS = 10;

const buildMarks = (start: number, end: number, steps: number) => {
  const marks = [];
  for (let year = start; year <= end; year += steps) {
    marks.push({
      value: year, label: year.toString()
    });
  }

  return marks;
};

interface YearSliderProps {
  selectedRange: [number, number],
  setSelectedRange: Dispatch<SetStateAction<[number, number]>>;
}

export function YearSlider({ selectedRange, setSelectedRange }: YearSliderProps) {
  const marks = buildMarks(MIN_YEAR, MAX_YEAR, STEPS);

  const [value, setValue] = useState<[number, number]>(selectedRange);

  return (
    <RangeSlider
      value={value}
      onChange={setValue}
      onChangeEnd={setSelectedRange}
      color="orange"
      min={MIN_YEAR}
      max={MAX_YEAR}
      minRange={3}
      step={1}
      defaultValue={selectedRange}
      marks={marks}
    />
  );
}
