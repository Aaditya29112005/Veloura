import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, category } = await req.json();
    if (!name || !category) {
      return NextResponse.json({ error: "Product name and category are required" }, { status: 400 });
    }

    const n = name.trim();
    const c = category.trim().toLowerCase();

    // High-end copy templates
    let description = `An elegant manifestation of craftsmanship, this ${n} is tailored for the modern silhouette. Combining architectural structure with daily comfort, it offers a sophisticated transition between casual ease and formal presence.`;
    let highlights = [
      "Ethically sourced premium materials",
      "Reinforced double-sticthed seams for structural longevity",
      "Hand-finished details along the hemlines",
      "Breathable weave designed for multi-seasonal layering"
    ];
    let fabricCare = "Dry clean only. Store on wide wooden hangers in a dry, ventilated closet.";

    if (c.includes("outerwear") || c.includes("coat") || c.includes("jacket") || c.includes("blazer")) {
      description = `Crafted from double-faced, high-density insulating fibers, the ${n} balances clean-cut tailored shoulders with a fluid, comfortable drape. An investment piece designed to endure elements while looking sharp.`;
      highlights = [
        "Premium wind-resistant outer shell lining",
        "Concealed custom horn buttons with reinforced backs",
        "Deep interior passport pocket and welt outer pockets",
        "Slightly relaxed silhouette for seamless winter layering"
      ];
      fabricCare = "Specialist dry clean only. Brush with soft bristle clothes brush between wears.";
    } else if (c.includes("tops") || c.includes("shirt") || c.includes("knitwear") || c.includes("sweater")) {
      description = `Knit from long-staple threads, this ${n} offers unparalleled luxury next-to-skin feel. Lightweight yet heat-retaining, the texture coordinates speak of sophisticated ease.`;
      highlights = [
        "Luxuriously soft high-grade long staple yarn",
        "Ribbed mock collar and custom knit cuffs",
        "Pre-washed to resist pilling and shrinkage",
        "Tailored close to body without constricting movement"
      ];
      fabricCare = "Hand wash cold inside out with pH-neutral detergent. Dry flat in shade. Do not wring.";
    } else if (c.includes("bottoms") || c.includes("trousers") || c.includes("pants") || c.includes("shorts")) {
      description = `The ${n} redefines premium legwear with a relaxed mid-rise waist and sharp pressed creases. Tailored to drop cleanly over your shoes with elegant movement.`;
      highlights = [
        "Adjustable side tabs for a customized beltless waist fit",
        "Traditional hook-and-bar front enclosure",
        "Deep cotton-lined pockets to secure essentials",
        "Generous hem allowance for personal tailoring length adjustment"
      ];
      fabricCare = "Machine wash cold on delicate cycle. Warm iron with press cloth. Hang to dry.";
    }

    return NextResponse.json({
      description,
      highlights,
      fabricCare,
    });
  } catch (error) {
    console.error("AI Description API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
