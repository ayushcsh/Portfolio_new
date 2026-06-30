"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IoIosAnalytics } from "react-icons/io";
import { github } from "@/app/data/contribution-graph-theme";
import EmptyState from "../shared/EmptyState";
import YearButton from "../shared/YearButton";

type ContributionDay = {
  date: string;
  count: number;
  level: number;
  weekday: number;
  week?: number;
};

type ContributionData = {
  total: number;
  days: ContributionDay[];
};

function withWeekIndexes(days: ContributionDay[]) {
  if (!days.length) return [];

  const start = new Date(`${days[0].date}T00:00:00Z`);
  const firstWeekday = start.getUTCDay();

  return days.map((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const offsetDays = Math.floor((date.getTime() - start.getTime()) / 86400000);

    return {
      ...day,
      week: Math.floor((offsetDays + firstWeekday) / 7),
    };
  });
}

function getMonthLabels(days: ContributionDay[], includeStartMonth = false) {
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

export default function ContributionGraph() {
  const [contributions, setContributions] = useState<ContributionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme, systemTheme } = useTheme();
  const [serverTheme, setServerTheme] = useState<"light" | "dark" | undefined>(
    undefined
  );
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const scheme =
    theme === "light" ? "light" : theme === "dark" ? "dark" : systemTheme;
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  const colors = github[serverTheme ?? "light"];
  const isCurrentYear = selectedYear === currentYear;
  const githubYears = [currentYear, 2025].filter(
    (year, index, allYears) => allYears.indexOf(year) === index
  );

  useEffect(() => {
    setServerTheme(scheme);
  }, [scheme]);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    fetch(
      isCurrentYear
        ? "/api/github-contributions?range=rolling"
        : `/api/github-contributions?year=${selectedYear}`
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load GitHub data");
        }

        setContributions(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [isCurrentYear, selectedYear]);

  if (!username) {
    return (
      <EmptyState
        icon={<IoIosAnalytics />}
        title="Unable to load Contribution Graph"
        message="We could not find any GitHub credentials added to the .env file. To display the graph, provide your username."
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<IoIosAnalytics />}
        title="Unable to load Contribution Graph"
        message={error}
      />
    );
  }

  const days = withWeekIndexes(contributions?.days ?? []);
  const monthLabels = getMonthLabels(days, !isCurrentYear);

  return (
    <div className="flex flex-col items-start gap-4 xl:flex-row">
      <div className="w-full min-w-0 dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 p-4 rounded-lg overflow-x-auto sm:p-6 lg:p-8 xl:overflow-visible">
        <div className="heatmap-grid relative">
          <div className="pl-1">
            <div className="relative mb-2 h-4 text-xs dark:text-zinc-400 text-zinc-500">
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
                  title={`${day.count} contributions on ${day.date}`}
                  className="rounded-sm"
                  style={{
                    height: "var(--heatmap-cell-size)",
                    width: "var(--heatmap-cell-size)",
                    backgroundColor: colors[day.level],
                    gridColumn: (day.week ?? 0) + 1,
                    gridRow: day.weekday + 1,
                  }}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm font-medium dark:text-zinc-300 text-zinc-700">
              <span>
                {isLoading
                  ? "Loading contributions..."
                  : `${contributions?.total ?? 0} contributions ${
                      isCurrentYear ? "in the last year" : `in ${selectedYear}`
                    }`}
              </span>
              <div className="flex shrink-0 items-center gap-1 text-xs font-normal dark:text-zinc-400 text-zinc-500">
                <span>Less</span>
                {colors.map((color: string) => (
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
        {githubYears.map((year) => (
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
  );
}
