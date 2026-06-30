"use client";

import { useEffect, useMemo, useState } from "react";
import { SiLeetcode } from "react-icons/si";
import { IoIosAnalytics } from "react-icons/io";
import EmptyState from "../shared/EmptyState";
import GithubCalendarComponent from "./GithubCalendarComponent";
import { Slide } from "@/app/animation/Slide";
import YearButton from "../shared/YearButton";

type LeetCodeData = {
  username: string;
  ranking: number | null;
  streak: number;
  activeDays: number;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  submissionCalendar: Record<string, number>;
};

type CalendarDay = {
  date: string;
  count: number;
  weekday: number;
  week: number;
};

const greenScale = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function getRollingDays(calendar: Record<string, number>): CalendarDay[] {
  const timestamps = Object.keys(calendar)
    .map((key) => Number(key))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (!timestamps.length) return [];

  const latestSubmissionDate = new Date(timestamps[timestamps.length - 1] * 1000);
  const today = new Date();
  const end =
    latestSubmissionDate > today
      ? latestSubmissionDate
      : new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  const firstWeekday = start.getUTCDay();
  const days: CalendarDay[] = [];

  for (
    let date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const ts = Math.floor(date.getTime() / 1000).toString();
    const offsetDays = Math.floor((date.getTime() - start.getTime()) / 86400000);

    days.push({
      date: date.toISOString().slice(0, 10),
      count: calendar[ts] ?? 0,
      weekday: date.getUTCDay(),
      week: Math.floor((offsetDays + firstWeekday) / 7),
    });
  }

  return days;
}

function getYearDays(
  calendar: Record<string, number>,
  year: number
): CalendarDay[] {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  const firstWeekday = start.getUTCDay();
  const days: CalendarDay[] = [];

  for (
    let date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const ts = Math.floor(date.getTime() / 1000).toString();
    const offsetDays = Math.floor((date.getTime() - start.getTime()) / 86400000);

    days.push({
      date: date.toISOString().slice(0, 10),
      count: calendar[ts] ?? 0,
      weekday: date.getUTCDay(),
      week: Math.floor((offsetDays + firstWeekday) / 7),
    });
  }

  return days;
}

function getMonthLabels(days: CalendarDay[], includeStartMonth = false) {
  if (!days.length) return [];

  const labels: Array<{ month: string; week: number }> = [];
  const start = new Date(`${days[0].date}T00:00:00Z`);
  const end = new Date(`${days[days.length - 1].date}T00:00:00Z`);

  const firstMonthOffset = includeStartMonth ? 0 : 1;

  for (
    let date = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + firstMonthOffset, 1)
    );
    date <= end;
    date.setUTCMonth(date.getUTCMonth() + 1)
  ) {
    const dateString = date.toISOString().slice(0, 10);
    const day = days.find((calendarDay) => calendarDay.date === dateString);

    labels.push({
      month: date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      week: day?.week ?? labels.length * 4,
    });
  }

  return labels;
}

function getLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export default function LeetCodeStats() {
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const username = process.env.NEXT_PUBLIC_LEETCODE_USERNAME;

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetch("/api/leetcode", { signal: controller.signal })
      .then(async (response) => {
        const text = await response.text();
        const result = text ? JSON.parse(text) : null;

        if (!response.ok) {
          throw new Error(result?.error ?? "Unable to load LeetCode data");
        }

        if (!result) {
          throw new Error("LeetCode data response was empty");
        }

        setData(result);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err.message ?? "Unable to load LeetCode data");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [username]);

  const isCurrentYear = selectedYear === currentYear;
  const days = useMemo(
    () =>
      isCurrentYear
        ? getRollingDays(data?.submissionCalendar ?? {})
        : getYearDays(data?.submissionCalendar ?? {}, selectedYear),
    [data?.submissionCalendar, isCurrentYear, selectedYear]
  );
  const yearSubmissions = useMemo(
    () => days.reduce((total, day) => total + day.count, 0),
    [days]
  );
  const monthLabels = useMemo(
    () => getMonthLabels(days, !isCurrentYear),
    [days, isCurrentYear]
  );
  const leetCodeYears = [currentYear, 2025].filter(
    (year, index, allYears) => allYears.indexOf(year) === index
  );

  if (!username) {
    return (
      <section className="mt-32 mb-16">
        <EmptyState
          icon={<SiLeetcode />}
          title="LeetCode Username Missing"
          message="Add NEXT_PUBLIC_LEETCODE_USERNAME to .env.local to show your LeetCode stats."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-32 mb-16">
        <EmptyState
          icon={<IoIosAnalytics />}
          title="Unable to load LeetCode"
          message={error}
        />
      </section>
    );
  }

  return (
    <section className="mt-32 mb-16 w-full">
      <Slide className="mb-8">
        <h2 className="font-incognito text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          LeetCode Progress
        </h2>
      </Slide>

      <Slide delay={0.05} className="mb-16">
        <div className="flex flex-col items-start gap-4 xl:flex-row">
          <div className="w-full min-w-0 rounded-lg border border-zinc-200 bg-secondary-bg p-4 overflow-x-auto dark:border-zinc-800 dark:bg-primary-bg sm:p-6 lg:p-8 xl:overflow-visible">
          <div className="heatmap-grid relative">
            <div className="pl-1">
              <div className="relative mb-2 h-4 text-xs text-zinc-500 dark:text-zinc-400">
                {monthLabels.map(({ month, week }) => (
                  <span
                    key={month}
                    className="absolute"
                    style={{ left: `calc(${week} * var(--heatmap-column-pitch))` }}
                  >
                    {month}
                  </span>
                ))}
              </div>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(53, var(--heatmap-cell-size))",
                  gridTemplateRows: "repeat(7, var(--heatmap-cell-size))",
                  gap: "var(--heatmap-cell-gap)",
                }}
              >
                {days.map((day) => (
                  <span
                    key={day.date}
                    title={`${day.count} submissions on ${day.date}`}
                    className="rounded-sm"
                    style={{
                      height: "var(--heatmap-cell-size)",
                      width: "var(--heatmap-cell-size)",
                      backgroundColor: greenScale[getLevel(day.count)],
                      gridColumn: day.week + 1,
                      gridRow: day.weekday + 1,
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span>
                  {loading
                    ? "Loading submissions..."
                    : `${yearSubmissions} submissions ${
                        isCurrentYear ? "in the last year" : `in ${selectedYear}`
                      }`}
                </span>
                <div className="flex shrink-0 items-center gap-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  <span>Less</span>
                  {greenScale.map((color) => (
                    <span
                      key={color}
                      className="rounded-sm"
                      style={{
                        backgroundColor: color,
                        height: "var(--heatmap-cell-size)",
                        width: "var(--heatmap-cell-size)",
                      }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="flex w-full flex-row flex-wrap justify-start gap-2 xl:w-auto xl:flex-col xl:pt-0">
            {leetCodeYears.map((year) => (
              <YearButton
                key={year}
                year={year}
                currentYear={selectedYear}
                label={year === currentYear ? "Current" : undefined}
                onClick={() => setSelectedYear(year)}
              />
            ))}
          </div>
        </div>
      </Slide>

      <GithubCalendarComponent />
    </section>
  );
}
