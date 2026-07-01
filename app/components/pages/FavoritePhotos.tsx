import Image from "next/image";
import Link from "next/link";
import { Slide } from "@/app/animation/Slide";

const galleryPhotos = [
  { file: "ph1.jpg", width: 720, height: 1204 },
  { file: "ph2.jpg", width: 736, height: 1450 },
  { file: "ph3.jpg", width: 675, height: 1200 },
  { file: "WhatsApp Image 2026-06-28 at 5.49.50 PM (1).jpeg", width: 3120, height: 4160 },
  { file: "WhatsApp Image 2026-06-28 at 5.49.50 PM.jpeg", width: 4032, height: 3024 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (10).jpeg", width: 828, height: 988 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (13).jpeg", width: 828, height: 1175 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (19).jpeg", width: 736, height: 1308 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (2).jpeg", width: 1440, height: 1440 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (20).jpeg", width: 736, height: 1308 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (21).jpeg", width: 640, height: 1136 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (22).jpeg", width: 736, height: 981 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (23).jpeg", width: 4032, height: 3024 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM (9).jpeg", width: 828, height: 996 },
  { file: "WhatsApp Image 2026-06-28 at 5.54.15 PM.jpeg", width: 3024, height: 4032 },
].map((photo, index) => ({
  id: `uploaded-photo-${index + 1}`,
  src: `/photos/${encodeURIComponent(photo.file)}`,
  alt: `Ayush Kumar gallery photo ${index + 1}`,
  caption: `Frame ${String(index + 1).padStart(2, "0")}`,
  width: photo.width,
  height: photo.height,
}));

type FavoritePhotosProps = {
  compact?: boolean;
};

export default function FavoritePhotos({ compact = false }: FavoritePhotosProps) {
  return (
    <section className={compact ? "" : "mt-32"}>
      <Slide delay={0.2}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-4 font-incognito text-4xl font-bold tracking-tight">
              Favorite Photos
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Everything is a picture waiting to be taken and a story waiting to be told.
            </p>
          </div>

          {!compact && (
            <Link
              href="/Beyondcode"
              className="w-fit text-sm font-medium text-tertiary-color transition hover:text-zinc-900 dark:text-primary-color dark:hover:text-white"
            >
              View photos
            </Link>
          )}
        </div>
      </Slide>

      <Slide delay={0.24}>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {galleryPhotos.map((photo, index) => (
            <figure
              key={photo.id}
              className="group mb-4 break-inside-avoid overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 shadow-line-light transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-line-dark dark:hover:shadow-zinc-950/30"
            >
              <div className="relative overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  priority={index < 3}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="h-auto w-full transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              {/* <figcaption className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span>{photo.caption}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary-color" />
              </figcaption> */}
            </figure>
          ))}
        </div>
      </Slide>
    </section>
  );
}
