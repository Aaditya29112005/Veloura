import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const query = prompt.toLowerCase();
    
    // Fetch active products with images
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: true }
    });

    let suggestions: any[] = [];
    let narrative = "";
    
    // Rule-based outfit matching
    if (query.includes("wedding") || query.includes("marriage") || query.includes("formal") || query.includes("gala")) {
      const top = products.find(p => p.slug.includes("blazer") || p.slug.includes("trench") || p.slug.includes("double-breasted")) || products[0];
      const bottom = products.find(p => p.slug.includes("trouser") || p.slug.includes("pant")) || products[1];
      const accessory = products.find(p => p.slug.includes("scarf") || p.slug.includes("belt") || p.slug.includes("knitwear")) || products[2];

      suggestions = [top, bottom, accessory].filter(Boolean);
      narrative = "For formal gala settings or weddings, we curate a sharp, classic silhouette. A structured tailoring top layered over drape trousers creates an effortless luxury statement. Accented with premium accessories.";
    } else if (query.includes("summer") || query.includes("beach") || query.includes("warm") || query.includes("vacation")) {
      const top = products.find(p => p.slug.includes("linen") || p.slug.includes("silk") || p.slug.includes("shirt")) || products[0];
      const bottom = products.find(p => p.slug.includes("shorts") || p.slug.includes("linen")) || products[1];
      const accessory = products.find(p => p.slug.includes("sandal") || p.slug.includes("slide") || p.slug.includes("knit")) || products[2];

      suggestions = [top, bottom, accessory].filter(Boolean);
      narrative = "Embrace warm-weather escapes with breathable washed linen textures. Relaxed silhouettes and airy tailoring prioritize thermal comfort while retaining elevated editorial lines.";
    } else {
      // Default: casual / smart daily wear
      const top = products.find(p => p.slug.includes("knit") || p.slug.includes("sweater") || p.slug.includes("polo")) || products[0];
      const bottom = products.find(p => p.slug.includes("denim") || p.slug.includes("jean") || p.slug.includes("shorts")) || products[1];
      const accessory = products.find(p => p.slug.includes("jacket") || p.slug.includes("coat")) || products[2];

      suggestions = [top, bottom, accessory].filter(Boolean);
      narrative = "An elevated daily casual wardrobe. Transition smoothly between home leisure and urban outings by matching premium knitwear texture coordinates with raw selvedge denim layers.";
    }

    // Mock shoe & watch accessory suggestions to satisfy requirement
    const shoes = {
      name: "Veloura Handmade Calfskin Derby Shoes",
      price: 245.0,
      description: "Full-grain calfskin leather, hand-stitched welt construction."
    };

    const watch = {
      name: "Veloura Heritage Automatic Watch",
      price: 520.0,
      description: "Minimalist dial, Japanese mechanical movement, genuine alligator leather strap."
    };

    const subtotal = suggestions.reduce((sum, p) => sum + p.price, 0) + shoes.price + watch.price;

    return NextResponse.json({
      narrative,
      outfit: suggestions.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        slug: p.slug,
        image: p.images[0]?.url || ""
      })),
      shoes,
      watch,
      subtotal,
    });
  } catch (error) {
    console.error("AI Stylist API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
