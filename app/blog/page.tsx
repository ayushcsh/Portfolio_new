import { Metadata } from "next";
import { BiDetail } from "react-icons/bi";
import Posts from "../components/pages/Posts";
import Social from "../components/shared/Social";
import { Slide } from "../animation/Slide";
import PageHeading from "@/app/components/shared/PageHeading";

export const metadata: Metadata = {
  title: "Blog | Ayush Kumar",
  metadataBase: new URL("https://ayushkumar.com/blog"),
  description: "Read latest stories from Ayush Kumar's Blog",
  openGraph: {
    title: "Blog | Ayush Kumar",
    url: "https://ayushkumar.com/blog",
    description: "Read latest stories from Ayush Kumar's Blog",
    images:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=90",
  },
};

export default async function Blog() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="Blog"
        description="Welcome to my blog domain where I share personal stories about things I've learned, projects I'm hacking on and just general findings."
      >
        <Social type="publication" />
      </PageHeading>

      <Slide delay={0.1}>
        <div className="flex items-center gap-x-3 mb-8">
          <BiDetail />
          <h2 className="text-xl font-semibold tracking-tight">Explore All</h2>
        </div>
        <Posts />
      </Slide>
    </main>
  );
}
