import { Metadata } from "next";
import ChessArena from "@/app/components/pages/ChessArena";
import FavoriteSongs from "@/app/components/pages/FavoriteSongs";
import FavoritePhotos from "@/app/components/pages/FavoritePhotos";

export const metadata: Metadata = {
  title: "Beyond Code | Ayush Kumar",
  description: "Explore the music, photos, and quiet chess corner beyond Ayush Kumar's code.",
  openGraph: {
    title: "Beyond Code | Ayush Kumar",
    description: "Explore the music, photos, and quiet chess corner beyond Ayush Kumar's code.",
    images:
      "/photos/WhatsApp%20Image%202026-06-28%20at%205.49.50%20PM%20(1).jpeg",
  },
};

export default function BeyondCode() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6 lg:mt-32 mt-20">
      <FavoriteSongs />
      <div className="mt-24 md:mt-32">
        <FavoritePhotos compact />
      </div>
      <ChessArena />
    </main>
  );
}
