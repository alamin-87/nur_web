const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80`;

const shots = {
  panel: u("1558618666-fcd25c85cd64"),
  plc: u("1581092160562-40aa08e78837"),
  motor: u("1581091226825-a6a2a5aee158"),
  circuit: u("1518770660439-4636190af475"),
  factory: u("1565043589221-1a6fd9ae45c7"),
  workshop: u("1565043666747-69f6646db940"),
  sensor: u("1581092918056-0c4c3acd3789"),
  lab: u("1581092160607-ee22621dd758"),
  bearing: u("1504328345606-18bbc8c9d7d1"),
  hands: u("1581091226825-a6a2a5aee158"),
};

const categoryGallery: Record<string, string[]> = {
  plc: [shots.plc, shots.panel, shots.circuit, shots.lab],
  motors: [shots.motor, shots.factory, shots.workshop, shots.bearing],
  drives: [shots.circuit, shots.panel, shots.motor, shots.factory],
  sensors: [shots.sensor, shots.lab, shots.plc, shots.workshop],
  contactors: [shots.panel, shots.circuit, shots.workshop, shots.plc],
  relays: [shots.panel, shots.circuit, shots.lab, shots.workshop],
  breakers: [shots.panel, shots.circuit, shots.workshop, shots.factory],
  hmi: [shots.plc, shots.lab, shots.panel, shots.circuit],
  "power-supplies": [shots.circuit, shots.panel, shots.plc, shots.lab],
  bearings: [shots.bearing, shots.workshop, shots.motor, shots.factory],
  cables: [shots.workshop, shots.panel, shots.circuit, shots.factory],
};

const categoryVideo: Record<string, string> = {
  plc: "https://www.youtube.com/watch?v=C9FcVJ9XIRQ",
  drives: "https://www.youtube.com/watch?v=S1GsF9l5vS0",
  motors: "https://www.youtube.com/watch?v=vtAglfe1Q8o",
  hmi: "https://www.youtube.com/watch?v=o-ZbgQ1q_ls",
  sensors: "https://www.youtube.com/watch?v=rYJwbaHKlYU",
};

export type ProductMedia = {
  images: string[];
  videoUrl?: string;
};

export function youtubeId(url?: string) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function getProductMedia(
  mainImage: string,
  categorySlug?: string,
  extraGallery: string[] = [],
  extraVideo?: string
): ProductMedia {
  const images: string[] = [];
  if (mainImage) images.push(mainImage);
  if (Array.isArray(extraGallery)) {
    for (const img of extraGallery) {
      if (img && !images.includes(img)) {
        images.push(img);
      }
    }
  }

  // Only fall back to category samples if no gallery images were specified at all
  if (images.length <= 1 && categorySlug && (!extraGallery || extraGallery.length === 0)) {
    const fromCategory = categoryGallery[categorySlug] || [];
    for (const img of fromCategory) {
      if (img && !images.includes(img)) {
        images.push(img);
      }
    }
  }

  const videoUrl = extraVideo || undefined;
  return { images, videoUrl };
}

