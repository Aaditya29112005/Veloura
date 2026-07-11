import { NextResponse } from "next/server";
import { getFullSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST() {
  try {
    const user = await getFullSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spinCost = 100;
    if (user.loyaltyCoins < spinCost) {
      return NextResponse.json({ 
        success: false, 
        message: `Insufficient coins. Spinning the Mystery Box requires ${spinCost} coins.` 
      });
    }

    // Roll random outcome
    const roll = Math.floor(Math.random() * 100) + 1;
    let rewardType = "";
    let rewardName = "";
    let coinsChange = -spinCost;
    let couponCode = "";

    const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();

    if (roll <= 15) {
      // Big Winner: $50 Coupon
      rewardType = "COUPON_50";
      couponCode = `BOX50-${suffix}`;
      rewardName = `a VIP $50 Discount Code (${couponCode})`;

      await db.coupon.create({
        data: {
          code: couponCode,
          discountType: "FIXED",
          discountValue: 50.0,
          minOrderValue: 150.0,
          active: true
        }
      });
    } else if (roll <= 50) {
      // Small Winner: $15 Coupon
      rewardType = "COUPON_15";
      couponCode = `BOX15-${suffix}`;
      rewardName = `a special $15 Discount Code (${couponCode})`;

      await db.coupon.create({
        data: {
          code: couponCode,
          discountType: "FIXED",
          discountValue: 15.0,
          minOrderValue: 50.0,
          active: true
        }
      });
    } else if (roll <= 80) {
      // Free Shipping: $10 off (shipping estimation cost)
      rewardType = "COUPON_SHIPPING";
      couponCode = `SHIP-${suffix}`;
      rewardName = `a Free Shipping Voucher Code (${couponCode})`;

      await db.coupon.create({
        data: {
          code: couponCode,
          discountType: "FIXED",
          discountValue: 10.0,
          minOrderValue: 30.0,
          active: true
        }
      });
    } else {
      // Coins Refund: +250 coins
      rewardType = "COINS_REFUND";
      coinsChange = -spinCost + 250; // Net +150 coins
      rewardName = "250 Loyalty Coins refunded!";
    }

    // Unlock 'Trendsetter' badge if spun the wheel
    const newBadges = [...user.badges];
    if (!newBadges.includes("Trendsetter")) {
      newBadges.push("Trendsetter");
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        loyaltyCoins: user.loyaltyCoins + coinsChange,
        badges: newBadges
      }
    });

    return NextResponse.json({
      success: true,
      rewardType,
      rewardName,
      couponCode,
      coinsGained: coinsChange > 0 ? coinsChange : 0,
      newBalance: updatedUser.loyaltyCoins,
      badges: updatedUser.badges,
      message: `Mystery Box unlocked: you won ${rewardName}.`
    });
  } catch (error) {
    console.error("Mystery Box Spin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
