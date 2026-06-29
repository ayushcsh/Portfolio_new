import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { BiBadgeCheck } from "react-icons/bi";
import { certificationsQuery, leetcodeBadgesQuery } from "@/lib/sanity.query";
import type { CertificationType, LeetCodeBadgeType } from "@/types";
import EmptyState from "../components/shared/EmptyState";
import { Slide } from "../animation/Slide";
import { sanityFetch } from "@/lib/sanity.client";
import PageHeading from "../components/shared/PageHeading";

export const metadata: Metadata = {
  title: "Certifications | Ayush Kumar",
  metadataBase: new URL("https://ayushkumar.com/certifications"),
  description: "Explore certifications and badges earned by Ayush Kumar",
  openGraph: {
    title: "Certifications | Ayush Kumar",
    url: "https://ayushkumar.com/certifications",
    description: "Explore certifications and badges earned by Ayush Kumar",
    images:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=90",
  },
};

export default async function Certifications() {
  const [certifications, leetcodeBadges] = await Promise.all([
    sanityFetch<CertificationType[]>({
      query: certificationsQuery,
      tags: ["certification"],
    }),
    sanityFetch<LeetCodeBadgeType[]>({
      query: leetcodeBadgesQuery,
      tags: ["leetcodeBadge"],
    }),
  ]);

  const marqueeBadges =
    leetcodeBadges.length > 0 ? [...leetcodeBadges, ...leetcodeBadges] : [];

  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="Certificates"
        description="A collection of certifications, badges, and learning milestones earned across tools, platforms, and technologies."
      />

      <Slide delay={0.1}>
        {certifications.length > 0 ? (
          <section className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 mb-12">
            {certifications.map((certification) => (
              <Link
                href={`/certifications/${certification.slug}`}
                key={certification._id}
                className="flex items-center gap-x-4 dark:bg-primary-bg bg-zinc-50 border border-transparent dark:hover:border-zinc-700 hover:border-zinc-200 p-4 rounded-lg"
              >
                {certification.logo ? (
                  <Image
                    src={certification.logo}
                    width={60}
                    height={60}
                    alt={certification.name}
                    className="dark:bg-zinc-800 bg-zinc-100 rounded-md p-2 object-contain"
                  />
                ) : (
                  <div className="dark:bg-primary-bg bg-zinc-50 border border-transparent dark:hover:border-zinc-700 hover:border-zinc-200 p-3 rounded-lg text-3xl">
                    <BiBadgeCheck aria-hidden="true" className="text-tertiary-color dark:text-primary-color" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg tracking-wide mb-1">
                    {certification.name}
                  </h2>
                  <div className="text-sm dark:text-zinc-400 text-zinc-600">
                    {certification.tagline}
                  </div>
                  {certification.issuer ? (
                    <div className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
                      {certification.issuer}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <EmptyState value="Certifications" />
        )}
      </Slide>

      {leetcodeBadges.length > 0 ? (
        <Slide delay={0.2}>
          <section className="mb-16">
            <div className="mb-5">
              <PageHeading
        title="LeetCode Badges"
        description="A collection of badges and achievements earned through consistent coding and problem-solving on LeetCode."
      />
            </div>

            <div
              className="leetcode-badge-marquee overflow-hidden"
              aria-label="LeetCode badges"
            >
              <div className="leetcode-badge-track flex w-max gap-4">
                {marqueeBadges.map((badge, index) => (
                  <article
                    key={`${badge._id}-${index}`}
                    className="w-[260px] shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-primary-bg"
                    aria-hidden={index >= leetcodeBadges.length}
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={badge.badgeSvg.image}
                        width={72}
                        height={72}
                        alt={badge.badgeSvg.alt ?? badge.title}
                        unoptimized
                        className="h-[72px] w-[72px] rounded-md bg-white object-contain p-2 dark:bg-zinc-900"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-medium tracking-wide">
                          {badge.title}
                        </h3>
                        <p className="mt-1 line-clamp-3 text-sm leading-5 dark:text-zinc-400 text-zinc-600">
                          {badge.about}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </Slide>
      ) : null}
    </main>
  );
}
