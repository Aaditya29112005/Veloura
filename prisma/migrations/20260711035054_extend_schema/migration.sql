-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colorHarmonies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "purchasedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wishlistedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastDailyRewardClaimed" TIMESTAMP(3),
ADD COLUMN     "loyaltyCoins" INTEGER NOT NULL DEFAULT 100;
