import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { height, weight, bodyType } = await req.json();
    if (!height || !weight || !bodyType) {
      return NextResponse.json({ error: "Missing body dimensions" }, { status: 400 });
    }

    const h = parseFloat(height);
    const w = parseFloat(weight);

    // Basic BMI calculation: weight / (height in meters)^2
    const bmi = w / Math.pow(h / 100, 2);

    let recommendedSize = "M";

    // Deterministic sizing algorithm
    if (h < 165) {
      if (w < 55) recommendedSize = "XS";
      else if (w < 65) recommendedSize = "S";
      else recommendedSize = "M";
    } else if (h < 178) {
      if (w < 62) recommendedSize = "S";
      else if (w < 78) recommendedSize = "M";
      else recommendedSize = "L";
    } else {
      if (w < 72) recommendedSize = "M";
      else if (w < 88) recommendedSize = "L";
      else recommendedSize = "XL";
    }

    // Nudge sizing based on body structure
    if (bodyType === "curvy" || bodyType === "athletic") {
      const sizes = ["XS", "S", "M", "L", "XL"];
      const currentIndex = sizes.indexOf(recommendedSize);
      if (currentIndex !== -1 && currentIndex < sizes.length - 1) {
        recommendedSize = sizes[currentIndex + 1]; // Nudge up for broad shoulders or curves
      }
    }

    return NextResponse.json({
      size: recommendedSize,
      bmi: parseFloat(bmi.toFixed(1)),
      rationale: `Based on your body height of ${h}cm, weight of ${w}kg, and an ${bodyType} build (BMI ${bmi.toFixed(1)}), our sizing matrix recommends a size ${recommendedSize} for a flattering, comfortable drape.`
    });
  } catch (error) {
    console.error("AI Size Predictor API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
