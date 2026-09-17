import { NextRequest, NextResponse } from "next/server";

export interface StockImageResult {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  author: string;
  authorUrl: string;
  source: string;
  attributionText: string;
  category: string;
}

/**
 * Curated high-resolution stock photography library.
 * Fully active even when no external search API keys are configured.
 */
const CURATED_STOCK_LIBRARY: StockImageResult[] = [
  // Technology & Cloud
  {
    id: "tech-1",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=70",
    alt: "Silicon Microchip Circuitry",
    author: "Alexandre Debiève",
    authorUrl: "https://unsplash.com/@alexandre_debieve",
    source: "Unsplash",
    attributionText: "Photo by Alexandre Debiève on Unsplash",
    category: "technology",
  },
  {
    id: "tech-2",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=70",
    alt: "Global Data Network Connections",
    author: "NASA / Unsplash",
    authorUrl: "https://unsplash.com/@nasa",
    source: "Unsplash",
    attributionText: "Photo by NASA on Unsplash",
    category: "technology",
  },
  {
    id: "tech-3",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=70",
    alt: "Matrix Digital Cyber Code",
    author: "Markus Spiske",
    authorUrl: "https://unsplash.com/@markusspiske",
    source: "Unsplash",
    attributionText: "Photo by Markus Spiske on Unsplash",
    category: "technology",
  },
  // Business, Executive & Finance
  {
    id: "biz-1",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70",
    alt: "Modern Corporate Glass Skyscraper",
    author: "Sean Pollock",
    authorUrl: "https://unsplash.com/@seanpollock",
    source: "Unsplash",
    attributionText: "Photo by Sean Pollock on Unsplash",
    category: "business",
  },
  {
    id: "biz-2",
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=70",
    alt: "Executive Leadership Strategy Meeting",
    author: "Amy Hirschi",
    authorUrl: "https://unsplash.com/@amyhirschi",
    source: "Unsplash",
    attributionText: "Photo by Amy Hirschi on Unsplash",
    category: "business",
  },
  {
    id: "biz-3",
    url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=70",
    alt: "Financial Market Analytics Chart Display",
    author: "Nicholas Cappello",
    authorUrl: "https://unsplash.com/@nicholascappello",
    source: "Unsplash",
    attributionText: "Photo by Nicholas Cappello on Unsplash",
    category: "finance",
  },
  // Science & Healthcare
  {
    id: "sci-1",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=70",
    alt: "Laboratory Beakers and Scientific Research",
    author: "Hans Reniers",
    authorUrl: "https://unsplash.com/@hansreniers",
    source: "Unsplash",
    attributionText: "Photo by Hans Reniers on Unsplash",
    category: "science",
  },
  {
    id: "med-1",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=70",
    alt: "Modern Clinical Healthcare Facility",
    author: "National Cancer Institute",
    authorUrl: "https://unsplash.com/@nci",
    source: "Unsplash",
    attributionText: "Photo by National Cancer Institute on Unsplash",
    category: "healthcare",
  },
  // Education & Learning
  {
    id: "edu-1",
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=70",
    alt: "University Library Bookshelves",
    author: "Giammarco Boscaro",
    authorUrl: "https://unsplash.com/@giammarco",
    source: "Unsplash",
    attributionText: "Photo by Giammarco Boscaro on Unsplash",
    category: "education",
  },
  // Children & Playful Education
  {
    id: "child-1",
    url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=70",
    alt: "Playful Learning and Childhood Creativity",
    author: "Senna Van Der Linden",
    authorUrl: "https://unsplash.com/@sennavdl",
    source: "Unsplash",
    attributionText: "Photo by Senna Van Der Linden on Unsplash",
    category: "education",
  },
  // Nature & Sustainability
  {
    id: "nature-1",
    url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=70",
    alt: "Lush Green Canopy and Forest Ecology",
    author: "Luca Bravo",
    authorUrl: "https://unsplash.com/@lucabravo",
    source: "Unsplash",
    attributionText: "Photo by Luca Bravo on Unsplash",
    category: "nature",
  },
  // Luxury & Architecture
  {
    id: "lux-1",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70",
    alt: "Modern Luxury Architectural Residence",
    author: "R Architecture",
    authorUrl: "https://unsplash.com/@rarchitecture",
    source: "Unsplash",
    attributionText: "Photo by R Architecture on Unsplash",
    category: "luxury",
  },
  // Creative & Design
  {
    id: "art-1",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=70",
    alt: "Abstract Colorful Acrylic Paint Texture",
    author: "Steve Johnson",
    authorUrl: "https://unsplash.com/@steve_j",
    source: "Unsplash",
    attributionText: "Photo by Steve Johnson on Unsplash",
    category: "creative",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim().toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("per_page") || "12", 10);

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

  // 1. If Unsplash API key is configured, query live Unsplash API
  if (unsplashKey && query) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
          next: { revalidate: 3600 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const results: StockImageResult[] = (data.results || []).map((img: any) => ({
          id: img.id,
          url: img.urls.regular,
          thumbUrl: img.urls.small,
          alt: img.alt_description || img.description || query,
          author: img.user.name,
          authorUrl: img.user.links.html,
          source: "Unsplash",
          attributionText: `Photo by ${img.user.name} on Unsplash`,
          category: "web_search",
        }));

        return NextResponse.json({
          results,
          total: data.total || results.length,
          provider: "unsplash_live",
          apiKeyConfigured: true,
        });
      }
    } catch (err: any) {
      console.warn("[Image Search] Live Unsplash query failed, falling back to curated stock:", err.message);
    }
  }

  // 2. If Pexels API key is configured, query live Pexels API
  if (pexelsKey && query) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        {
          headers: { Authorization: pexelsKey },
          next: { revalidate: 3600 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const results: StockImageResult[] = (data.photos || []).map((p: any) => ({
          id: String(p.id),
          url: p.src.large,
          thumbUrl: p.src.medium,
          alt: p.alt || query,
          author: p.photographer,
          authorUrl: p.photographer_url,
          source: "Pexels",
          attributionText: `Photo by ${p.photographer} on Pexels`,
          category: "web_search",
        }));

        return NextResponse.json({
          results,
          total: data.total_results || results.length,
          provider: "pexels_live",
          apiKeyConfigured: true,
        });
      }
    } catch (err: any) {
      console.warn("[Image Search] Live Pexels query failed, falling back to curated stock:", err.message);
    }
  }

  // 3. Fallback: Query Curated High-Resolution Library
  let filtered = CURATED_STOCK_LIBRARY;
  if (query) {
    const tokens = query.split(/\s+/);
    filtered = CURATED_STOCK_LIBRARY.filter((item) => {
      const target = `${item.alt} ${item.category} ${item.author}`.toLowerCase();
      return tokens.some((t) => target.includes(t));
    });
    // If no exact match, fallback to full library so user always gets usable photos
    if (filtered.length === 0) {
      filtered = CURATED_STOCK_LIBRARY;
    }
  }

  const startIndex = (page - 1) * perPage;
  const paginated = filtered.slice(startIndex, startIndex + perPage);

  return NextResponse.json({
    results: paginated,
    total: filtered.length,
    provider: "curated_library",
    apiKeyConfigured: Boolean(unsplashKey || pexelsKey),
    note: "Curated stock photography active. Optional: Add UNSPLASH_ACCESS_KEY or PEXELS_API_KEY to .env.local to query the full live 5M+ web library.",
  });
}
