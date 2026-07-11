import { NextResponse } from "next/server";
import { getFullSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const user = await getFullSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const lastClaimStr = user.lastDailyRewardClaimed 
      ? user.lastDailyRewardClaimed.toISOString().split("T")[0] 
      : null;

    if (lastClaimStr === todayStr) {
      return NextResponse.json({
        claimed: false,
        message: "You have already claimed your daily reward today. Check back tomorrow!"
      });
    }

    // Unlocking first badge if not already unlocked
    const newBadges = [...user.badges];
    if (!newBadges.includes("Explorer")) {
      newBadges.push("Explorer");
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        loyaltyCoins: user.loyaltyCoins + 50,
        lastDailyRewardClaimed: new Date(),
        badges: newBadges
      }
    });

    return NextResponse.json({
      claimed: true,
      coinsGained: 50,
      newBalance: updatedUser.loyaltyCoins,
      badges: updatedUser.badges,
      message: "Congratulations! You earned 50 loyalty coins. Unlocked: 'Explorer' badge."
    });
  } catch (error) {
    console.error("Daily Reward API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
