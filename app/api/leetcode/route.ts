import { NextResponse } from "next/server";

type DifficultyStat = {
  difficulty: string;
  count: number;
  submissions: number;
};

type LeetCodeGraphQLResponse = {
  data?: {
    allQuestionsCount?: Array<{
      difficulty: string;
      count: number;
    }>;
    matchedUser?: {
      username: string;
      profile: {
        ranking: number | null;
        reputation: number;
      };
      submitStatsGlobal: {
        acSubmissionNum: DifficultyStat[];
        totalSubmissionNum: DifficultyStat[];
      };
      userCalendar: {
        streak: number;
        totalActiveDays: number;
        submissionCalendar: string;
      };
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

const query = `
  query userProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      userCalendar {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

function findStat(stats: Array<{ difficulty: string; count: number }>, difficulty: string) {
  return stats.find((stat) => stat.difficulty === difficulty)?.count ?? 0;
}

function parseCalendar(calendar?: string) {
  if (!calendar) return {};

  try {
    return JSON.parse(calendar) as Record<string, number>;
  } catch {
    return {};
  }
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error("LeetCode returned an empty response");
  }

  try {
    return JSON.parse(text) as LeetCodeGraphQLResponse;
  } catch {
    throw new Error("LeetCode returned invalid JSON");
  }
}

export async function GET() {
  const username = process.env.NEXT_PUBLIC_LEETCODE_USERNAME?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_LEETCODE_USERNAME" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/u/${username}/`,
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    const result = await readJsonResponse(response);
    const user = result.data?.matchedUser;
    const questionCounts = result.data?.allQuestionsCount ?? [];

    if (!response.ok || result.errors?.length || !user) {
      return NextResponse.json(
        {
          error:
            result.errors?.[0]?.message ??
            "Unable to load LeetCode profile. Check the username.",
        },
        { status: response.status || 500 }
      );
    }

    const accepted = user.submitStatsGlobal.acSubmissionNum;
    const submitted = user.submitStatsGlobal.totalSubmissionNum;

    return NextResponse.json({
      username: user.username,
      ranking: user.profile.ranking,
      contributionPoint: 0,
      reputation: user.profile.reputation ?? 0,
      streak: user.userCalendar.streak,
      activeDays: user.userCalendar.totalActiveDays,
      totalSolved: findStat(accepted, "All"),
      totalQuestions: findStat(questionCounts, "All"),
      easySolved: findStat(accepted, "Easy"),
      totalEasy: findStat(questionCounts, "Easy"),
      mediumSolved: findStat(accepted, "Medium"),
      totalMedium: findStat(questionCounts, "Medium"),
      hardSolved: findStat(accepted, "Hard"),
      totalHard: findStat(questionCounts, "Hard"),
      acceptedSubmissions: accepted,
      totalSubmissions: submitted,
      submissionCalendar: parseCalendar(user.userCalendar.submissionCalendar),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load LeetCode data";

    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
