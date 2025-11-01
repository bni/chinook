import { RangeSlider } from "@mantine/core";
import { Dispatch, SetStateAction, useState } from "react";

const buildMarks = (start: number, end: number, steps: number) => {
  const minYear = start;

  const marks = [];
  for (let year = minYear; year <= end; year += steps) {
    marks.push({
      value: year, label: year.toString()
    });
  }

  const maxYear = marks[marks.length - 1].value;

  return { minYear, maxYear, marks };
};

interface YearSliderProps {
  selectedRange: [number, number],
  setSelectedRange: Dispatch<SetStateAction<[number, number]>>;
}

export function YearSlider({ selectedRange, setSelectedRange }: YearSliderProps) {
  const { minYear, maxYear, marks } = buildMarks(1940, 2030, 10);

  const [value, setValue] = useState<[number, number]>(selectedRange);

  return (
    <RangeSlider
      value={value}
      onChange={setValue}
      onChangeEnd={setSelectedRange}
      color="orange"
      min={minYear}
      max={maxYear}
      minRange={3}
      step={1}
      defaultValue={selectedRange}
      marks={marks}
    />
  );
}
