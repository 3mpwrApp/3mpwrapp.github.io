#!/usr/bin/env node
/**
 * Multi-Day Collection Scheduler
 * 
 * Strategy: Collect data over 7 days to stay within quota
 * Each day focuses on specific years or tribunals
 * 
 * Day 1: Ontario 2024-2026 (recent)
 * Day 2: Ontario 2021-2023 
 * Day 3: Ontario 2018-2020
 * Day 4: BC 2020-2026
 * Day 5: Alberta + Prairies 2020-2026
 * Day 6: Quebec + Atlantic 2020-2026
 * Day 7: Territories + Federal 2020-2026
 */

const COLLECTION_SCHEDULE = {
  day1: {
    name: "Ontario Recent (2024-2026)",
    tribunals: ["onwsiat", "onca", "onhrt"],
    years: [2024, 2025, 2026],
    estimatedCases: 1500,
    estimatedTime: "2-3 hours"
  },
  day2: {
    name: "Ontario Mid (2021-2023)",
    tribunals: ["onwsiat", "onca", "onhrt"],
    years: [2021, 2022, 2023],
    estimatedCases: 2500,
    estimatedTime: "3-4 hours"
  },
  day3: {
    name: "Ontario Older (2018-2020)",
    tribunals: ["onwsiat", "onca", "onhrt"],
    years: [2018, 2019, 2020],
    estimatedCases: 2000,
    estimatedTime: "2-3 hours"
  },
  day4: {
    name: "British Columbia (2020-2026)",
    tribunals: ["bchrt", "bcwcat", "bcca"],
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
    estimatedCases: 1500,
    estimatedTime: "2-3 hours"
  },
  day5: {
    name: "Prairies (AB, SK, MB) (2020-2026)",
    tribunals: ["abqb", "abca", "skca", "mbca"],
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
    estimatedCases: 800,
    estimatedTime: "1-2 hours"
  },
  day6: {
    name: "Quebec + Atlantic (2020-2026)",
    tribunals: ["qctat", "qcca", "nbca", "nsca", "peca", "nlca"],
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
    estimatedCases: 1000,
    estimatedTime: "1-2 hours"
  },
  day7: {
    name: "Territories + Federal (2020-2026)",
    tribunals: ["ykca", "nwtca", "nuca", "chrt", "fct", "fca"],
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
    estimatedCases: 500,
    estimatedTime: "1 hour"
  }
};

// Run today's collection
const today = new Date();
const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
const schedule = Object.values(COLLECTION_SCHEDULE);
const todaySchedule = schedule[dayOfWeek % 7];

console.log(`📅 Today is Day ${dayOfWeek + 1} of 7`);
console.log(`🎯 Collection: ${todaySchedule.name}`);
console.log(`📊 Estimated: ${todaySchedule.estimatedCases} cases in ${todaySchedule.estimatedTime}`);
console.log(`\nRun command:`);
console.log(`node scrape-direct-enumeration.js --tribunals=${todaySchedule.tribunals.join(',')} --years=${todaySchedule.years.join(',')}`);

module.exports = COLLECTION_SCHEDULE;
