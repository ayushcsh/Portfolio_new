import { NextResponse } from "next/server";

type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

type GitHubDay = {
  date: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
  weekday: number;
};

const levelMap: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const query = `
  query Contributions($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              weekday
            }
          }
        }
      }
    }
  }
`;

export async function GET(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const range = searchParams.get("range");

  if (!token || !username) {
    return NextResponse.json(
      { error: "Missing GitHub username or token" },
      { status: 400 }
    );
  }

  const today = new Date();
  const endDate =
    range === "rolling"
      ? new Date(
          Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        )
      : new Date(Date.UTC(year, 11, 31, 23, 59, 59));
  const startDate =
    range === "rolling"
      ? new Date(endDate)
      : new Date(Date.UTC(year, 0, 1, 0, 0, 0));

  if (range === "rolling") {
    startDate.setUTCDate(startDate.getUTCDate() - 364);
    startDate.setUTCHours(0, 0, 0, 0);
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        username,
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    }),
    next: { revalidate: 3600 },
  });

  const json = await response.json();

  if (!response.ok || json.errors?.length) {
    return NextResponse.json(
      { error: json.errors?.[0]?.message ?? "GitHub request failed" },
      { status: response.status || 500 }
    );
  }

  const calendar =
    json.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks
    .flatMap((week: { contributionDays: GitHubDay[] }) => week.contributionDays)
    .map((day: GitHubDay) => ({
      date: day.date,
      count: day.contributionCount,
      level: levelMap[day.contributionLevel],
      weekday: day.weekday,
    }));

  return NextResponse.json({
    total: calendar.totalContributions,
    year,
    range: range === "rolling" ? "rolling" : "year",
    days,
  });
}
