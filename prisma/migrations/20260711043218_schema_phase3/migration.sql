-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryScheduledFor" TIMESTAMP(3),
ADD COLUMN     "giftMessage" TEXT,
ADD COLUMN     "giftRecipient" TEXT,
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ecoBadges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "returnRisk" TEXT NOT NULL DEFAULT 'Low',
ADD COLUMN     "sustainabilityScore" INTEGER NOT NULL DEFAULT 85;
