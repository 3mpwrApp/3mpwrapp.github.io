export type WaitStat = { province: string; medianDays: number; p90Days: number };
export const waitTimes: WaitStat[] = [
  { province: 'ON', medianDays: 28, p90Days: 75 },
  { province: 'BC', medianDays: 32, p90Days: 82 },
  { province: 'AB', medianDays: 26, p90Days: 68 },
  { province: 'QC', medianDays: 35, p90Days: 90 },
  { province: 'MB', medianDays: 30, p90Days: 80 },
];

