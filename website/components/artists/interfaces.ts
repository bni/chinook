interface Mark {
  value: number,
  label: string
}

export interface SliderProps {
  minYear: number,
  maxYear: number,
  marks: Mark[],
  defaultRange: [number, number]
}
