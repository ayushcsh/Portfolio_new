import "server-only";
import { createClient, type ClientConfig, type QueryParams } from "next-sanity";
import {
  projectId,
  dataset,
  apiVersion,
  token,
  mode,
  hasSanityConfig,
} from "@/lib/env.api";

const config: ClientConfig = {
  projectId: projectId ?? "",
  dataset: dataset ?? "production",
  apiVersion,
  useCdn: mode === "development" ? true : false,
  ignoreBrowserTokenWarning: true,
  token,
  perspective: "published",
};

const client = hasSanityConfig ? createClient(config) : null;

function emptySanityResponse<QueryResponse>(query: string): QueryResponse {
  return (query.includes("[0]") ? null : []) as QueryResponse;
}

export async function sanityFetch<QueryResponse>({
  query,
  qParams = {},
  tags,
}: {
  query: string;
  qParams?: QueryParams;
  tags: string[];
}): Promise<QueryResponse> {
  if (!client) {
    return emptySanityResponse<QueryResponse>(query);
  }

  try {
    return await client.fetch<QueryResponse>(query, qParams, {
      cache: mode === "development" ? "no-store" : "force-cache",
      next: { tags },
    });
  } catch (error) {
    console.error("Sanity fetch failed:", error);
    return emptySanityResponse<QueryResponse>(query);
  }
}
