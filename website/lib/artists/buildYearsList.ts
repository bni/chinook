export const buildYearsList = (fromYear: number, toYear: number): number[] => {
  const years: number[] = [];

  if (fromYear < toYear) {
    for (let i = fromYear; i <= toYear; i++) {
      years.push(i);
    }
  } else if (toYear < fromYear) {
    for (let i = toYear; i <= fromYear; i++) {
      years.push(i);
    }
  } else {
    years.push(fromYear);
  }

  return years;
};
