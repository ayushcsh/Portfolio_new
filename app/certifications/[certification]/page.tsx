import Image from "next/image";
import { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { BiLinkExternal } from "react-icons/bi";
import { singleCertificationQuery } from "@/lib/sanity.query";
import type { CertificationType } from "@/types";
import { CustomPortableText } from "@/app/components/shared/CustomPortableText";
import { Slide } from "../../animation/Slide";
import { urlFor } from "@/lib/sanity.image";
import { sanityFetch } from "@/lib/sanity.client";

type Props = {
  params: {
    certification: string;
  };
};

const fallbackImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=90";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.certification;
  const certification: CertificationType = await sanityFetch({
    query: singleCertificationQuery,
    tags: ["certification"],
    qParams: { slug },
  });

  return {
    title: `${certification.name} | Certificate`,
    metadataBase: new URL(`https://ayushkumar.com/certifications/${certification.slug}`),
    description: certification.tagline,
    openGraph: {
      images: certification.coverImage
        ? urlFor(certification.coverImage.image).width(1200).height(630).url()
        : fallbackImage,
      url: `https://ayushkumar.com/certifications/${certification.slug}`,
      title: certification.name,
      description: certification.tagline,
    },
  };
}

export default async function Certification({ params }: Props) {
  const slug = params.certification;
  const certification: CertificationType = await sanityFetch({
    query: singleCertificationQuery,
    tags: ["certification"],
    qParams: { slug },
  });

  return (
    <main className="max-w-6xl mx-auto lg:px-16 px-8">
      <Slide>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between flex-wrap mb-4 gap-3">
            <div>
              <h1 className="font-incognito font-black tracking-tight sm:text-5xl text-3xl mb-3 max-w-md">
                {certification.name}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                {[certification.issuer, certification.issuedDate]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>

            <a
              href={certification.credentialUrl}
              rel="noreferrer noopener"
              target="_blank"
              className={`flex items-center gap-x-2 dark:bg-primary-bg bg-secondary-bg dark:text-white text-zinc-700 border border-transparent rounded-md px-4 py-2 duration-200 ${
                !certification.credentialUrl
                  ? "cursor-not-allowed opacity-80"
                  : "cursor-pointer hover:dark:border-zinc-700 hover:border-zinc-200"
              }`}
            >
              <BiLinkExternal aria-hidden="true" />
              {certification.credentialUrl ? "Verify" : "No Link"}
            </a>
          </div>

          <div className="relative w-full h-40 pt-[52.5%]">
            <Image
              className="rounded-xl border dark:border-zinc-800 border-zinc-100 object-cover"
              fill
              src={certification.coverImage?.image ?? fallbackImage}
              alt={certification.coverImage?.alt ?? certification.name}
              quality={100}
              placeholder={certification.coverImage?.lqip ? "blur" : "empty"}
              blurDataURL={certification.coverImage?.lqip || ""}
            />
          </div>

          {certification.description ? (
            <div className="mt-8 dark:text-zinc-400 text-zinc-600 leading-relaxed">
              <PortableText
                value={certification.description}
                components={CustomPortableText}
              />
            </div>
          ) : null}
        </div>
      </Slide>
    </main>
  );
}
