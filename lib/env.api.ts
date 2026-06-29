const optionalValue = (value: string | undefined) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
};

export const projectId = optionalValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
export const dataset = optionalValue(process.env.NEXT_PUBLIC_SANITY_DATASET);
export const token = optionalValue(process.env.NEXT_PUBLIC_SANITY_ACCESS_TOKEN);

export const hookSecret = process.env.NEXT_PUBLIC_SANITY_HOOK_SECRET;
export const mode = process.env.NODE_ENV;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-07-21";

export const giscusRepoId = optionalValue(process.env.NEXT_PUBLIC_GISCUS_REPOID);
export const giscusCategoryId = optionalValue(
  process.env.NEXT_PUBLIC_GISCUS_CATEGORYID
);
export const umamiSiteId = optionalValue(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);
export const hasSanityConfig = Boolean(projectId && dataset);
