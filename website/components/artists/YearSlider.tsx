import { RangeSlider } from "@mantine/core";
import { Dispatch, SetStateAction, useState } from "react";
import { SliderProps } from "./interfaces";

interface YearSliderProps extends SliderProps {
  setSelectedRange: Dispatch<SetStateAction<[number, number]>>;
}

export function YearSlider({ minYear, maxYear, marks, defaultRange, setSelectedRange }: YearSliderProps) {
  const [value, setValue] = useState<[number, number]>(defaultRange);

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
      defaultValue={defaultRange}
      marks={marks}
    />
  );
}
