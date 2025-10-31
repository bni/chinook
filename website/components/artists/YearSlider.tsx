import { RangeSlider } from "@mantine/core";
import { Dispatch, SetStateAction, useState } from "react";

interface Params {
  defaultRange: [number, number];
  setSelectedRange: Dispatch<SetStateAction<[number, number]>>;
}

export function YearSlider({ defaultRange, setSelectedRange }: Params) {
  const [value, setValue] = useState<[number, number]>(defaultRange);

  return (
    <RangeSlider
      value={value}
      onChange={setValue}
      onChangeEnd={setSelectedRange}
      color="orange"
      min={1940}
      max={2020}
      minRange={3}
      step={1}
      defaultValue={defaultRange}
      marks={[
        { value: 1940, label: "1940" },
        { value: 1950, label: "1950" },
        { value: 1960, label: "1960" },
        { value: 1970, label: "1970" },
        { value: 1980, label: "1980" },
        { value: 1990, label: "1990" },
        { value: 2000, label: "2000" },
        { value: 2010, label: "2010" },
        { value: 2020, label: "2020" }
      ]}
    />
  );
}
