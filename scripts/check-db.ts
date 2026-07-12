import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Auditing Veloura database records...");
  
  const userCount = await prisma.user.count();
  console.log(`Registered users count: ${userCount}`);
  
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true
    }
  });
  console.log("Users:", users);

  const productCount = await prisma.product.count();
  console.log(`Database products count: ${productCount}`);
}

main()
  .catch((e) => {
    console.error("Database connection check failed:", e);
  })
  .finally(() => prisma.$disconnect());
