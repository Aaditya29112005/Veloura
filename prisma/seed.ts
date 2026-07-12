import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned database.");

  // Create Users
  const passwordHashUser = await bcrypt.hash("password123", 10);
  const passwordHashAdmin = await bcrypt.hash("admin123", 10);

  const shopper = await prisma.user.create({
    data: {
      email: "shopper@luxury.com",
      name: "Jane Doe",
      passwordHash: passwordHashUser,
      role: "USER",
      loyaltyCoins: 450,
      badges: ["Explorer", "VIP Buyer"],
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@luxury.com",
      name: "Alexander McQueen",
      passwordHash: passwordHashAdmin,
      role: "ADMIN",
    },
  });

  console.log("Created users:", { shopper: shopper.email, admin: admin.email });

  // Create Addresses
  await prisma.address.create({
    data: {
      userId: shopper.id,
      street: "123 Fifth Avenue",
      city: "New York",
      state: "NY",
      postalCode: "10003",
      country: "United States",
      isDefault: true,
    },
  });

  // Create Coupons
  const couponPercent = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 50,
      active: true,
    },
  });

  const couponFixed = await prisma.coupon.create({
    data: {
      code: "LUXURY50",
      discountType: "FIXED",
      discountValue: 50,
      minOrderValue: 200,
      active: true,
    },
  });

  console.log("Created coupons:", [couponPercent.code, couponFixed.code]);

  // Create Categories
  const categoriesData = [
    { name: "Outerwear", slug: "outerwear", description: "Tailored coats, jackets, and parkas." },
    { name: "Knitwear", slug: "knitwear", description: "Premium wool, cashmere, and cotton sweaters." },
    { name: "Tops & Shirts", slug: "tops-shirts", description: "Classic button-downs, silk shirts, and tees." },
    { name: "Bottoms", slug: "bottoms", description: "Structured trousers, modern skirts, and classic denim." },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  console.log("Created categories.");

  // Create Products
  const productsData = [
    // --- Outerwear ---
    {
      name: "Cashmere Double-Breasted Trench Coat",
      slug: "cashmere-double-breasted-trench-coat",
      description: "Crafted from pure cashmere, this double-breasted trench coat features a structured silhouette, horn buttons, and a belted waist for timeless luxury.",
      price: 389.0,
      stock: 12,
      categorySlug: "outerwear",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Camel", "Black", "Charcoal"],
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Structured Wool Blazer",
      slug: "structured-wool-blazer",
      description: "A tailored wool blazer featuring sharp lapels, dual front buttons, and double back vents. Ideal for transitioning from day to evening.",
      price: 249.0,
      stock: 18,
      categorySlug: "outerwear",
      sizes: ["S", "M", "L"],
      colors: ["Navy", "Charcoal", "Black"],
      images: [
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Suede Trucker Jacket",
      slug: "suede-trucker-jacket",
      description: "Rich goat suede trucker jacket featuring metal buttons, chest flap pockets, and a soft satin lining. A rugged yet refined layering piece.",
      price: 299.0,
      stock: 8,
      categorySlug: "outerwear",
      sizes: ["M", "L", "XL"],
      colors: ["Tan", "Olive"],
      images: [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Minimalist Oversized Bomber Jacket",
      slug: "minimalist-oversized-bomber-jacket",
      description: "Water-resistant matte nylon bomber jacket with heavy-gauge silver zippers, rib-knit cuffs, and drop-shoulder styling.",
      price: 189.0,
      stock: 15,
      categorySlug: "outerwear",
      sizes: ["S", "M", "L"],
      colors: ["Black", "Sage"],
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Leather Shearling Jacket",
      slug: "leather-shearling-jacket",
      description: "Premium heavy-weight leather jacket lined with authentic shearling wool for supreme warmth in colder seasons.",
      price: 450.0,
      stock: 4,
      categorySlug: "outerwear",
      sizes: ["M", "L", "XL"],
      colors: ["Dark Brown", "Black"],
      images: [
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&auto=format&fit=crop&q=80",
      ],
    },

    // --- Knitwear ---
    {
      name: "Ribbed Merino Wool Crewneck",
      slug: "ribbed-merino-wool-crewneck",
      description: "Spun from superfine Italian merino wool, this crewneck sweater offers a slim profile and exceptional breathable insulation.",
      price: 129.0,
      stock: 22,
      categorySlug: "knitwear",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Cream", "Grey", "Navy"],
      images: [
        "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Oversized Cashmere Turtleneck",
      slug: "oversized-cashmere-turtleneck",
      description: "Luxurious, thick knit Mongolian cashmere turtleneck. Loose fit with ribbed cuffs and dropped tail hem.",
      price: 219.0,
      stock: 10,
      categorySlug: "knitwear",
      sizes: ["S", "M", "L"],
      colors: ["Oatmeal", "Black", "Dusty Pink"],
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Cable-Knit Shawl Cardigan",
      slug: "cable-knit-shawl-cardigan",
      description: "Chunky cotton-wool blend cardigan with an elegant shawl collar, braided cable detailing, and wooden toggle buttons.",
      price: 159.0,
      stock: 14,
      categorySlug: "knitwear",
      sizes: ["M", "L", "XL"],
      colors: ["Navy", "Off-White"],
      images: [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Fine Knit Linen Sweater",
      slug: "fine-knit-linen-sweater",
      description: "Lightweight sweater crafted from a breathable linen-silk blend. Perfect for breezy summer evenings and layering.",
      price: 99.0,
      stock: 20,
      categorySlug: "knitwear",
      sizes: ["S", "M", "L"],
      colors: ["Sage Green", "Cream"],
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Classic V-Neck Wool Vest",
      slug: "classic-v-neck-wool-vest",
      description: "Fine knit merino wool vest featuring a deep V-neckline and ribbed trims. Designed for easy layering over tailored shirts.",
      price: 119.0,
      stock: 12,
      categorySlug: "knitwear",
      sizes: ["S", "M", "L"],
      colors: ["Navy", "Grey"],
      images: [
        "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=600&auto=format&fit=crop&q=80",
      ],
    },

    // --- Tops & Shirts ---
    {
      name: "Silk Button-Down Shirt",
      slug: "silk-button-down-shirt",
      description: "Made from premium mulberry silk, this button-down features a subtle satin sheen, mother-of-pearl buttons, and a relaxed drape.",
      price: 149.0,
      stock: 15,
      categorySlug: "tops-shirts",
      sizes: ["S", "M", "L"],
      colors: ["Off-White", "Emerald", "Black"],
      images: [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Oxford Cotton Button-Down",
      slug: "oxford-cotton-button-down",
      description: "Heavyweight Oxford cotton shirt with button-down collar, box pleat, and locker loop. Garment-washed for a soft feel.",
      price: 79.0,
      stock: 30,
      categorySlug: "tops-shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "White", "Pink"],
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Supima Cotton Luxury Tee",
      slug: "supima-cotton-luxury-tee",
      description: "Crafted from long-staple Supima cotton for ultimate softness, strength, and color retention. Classic crewneck fit.",
      price: 39.0,
      stock: 50,
      categorySlug: "tops-shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Black", "Grey", "Olive"],
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Classic Polo in Cotton Pique",
      slug: "classic-polo-in-cotton-pique",
      description: "A sporty yet polished polo shirt in double-knit cotton pique. Features a clean 2-button placket and ribbed collar.",
      price: 59.0,
      stock: 25,
      categorySlug: "tops-shirts",
      sizes: ["M", "L", "XL"],
      colors: ["Navy", "White", "Forest Green"],
      images: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Linen Mandarin Collar Shirt",
      slug: "linen-mandarin-collar-shirt",
      description: "Pure Belgian linen shirt with a modern band/mandarin collar. Perfect for warm-weather resort dressing.",
      price: 89.0,
      stock: 18,
      categorySlug: "tops-shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Natural Linen", "Navy"],
      images: [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
      ],
    },

    // --- Bottoms ---
    {
      name: "Tailored Pleated Trousers",
      slug: "tailored-pleated-trousers",
      description: "Made from a wool-viscose blend, these trousers feature a high waist, double front pleats, a zip fly, and a relaxed straight-leg drape.",
      price: 139.0,
      stock: 16,
      categorySlug: "bottoms",
      sizes: ["S", "M", "L"],
      colors: ["Charcoal", "Taupe", "Black"],
      images: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Selvedge Slim-Fit Denim Jeans",
      slug: "selvedge-slim-fit-denim-jeans",
      description: "Raw Japanese selvedge denim jeans. Rigid 14oz construction that breaks in beautifully over time to form unique fades.",
      price: 169.0,
      stock: 20,
      categorySlug: "bottoms",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Indigo", "Black"],
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Standard Drawstring Chinos",
      slug: "standard-drawstring-chinos",
      description: "An easy-wearing hybrid pant featuring a comfortable elastic waist with internal drawstring, combined with structured chino styling.",
      price: 99.0,
      stock: 22,
      categorySlug: "bottoms",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Khaki", "Olive", "Navy"],
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "A-Line Leather Midi Skirt",
      slug: "a-line-leather-midi-skirt",
      description: "Buttery-soft lambskin leather midi skirt with an A-line shape, structured panels, and a concealed rear zip closure.",
      price: 249.0,
      stock: 6,
      categorySlug: "bottoms",
      sizes: ["S", "M", "L"],
      colors: ["Tan", "Black"],
      images: [
        "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Linen Easy Shorts",
      slug: "linen-easy-shorts",
      description: "Relaxed-fit shorts crafted from washed linen. Features side seam pockets, a single back pocket, and an elasticated waist.",
      price: 69.0,
      stock: 30,
      categorySlug: "bottoms",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Oatmeal", "Navy", "Olive"],
      images: [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80",
      ],
    },
  ];

  for (const item of productsData) {
    const category = categories[item.categorySlug];
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        stock: item.stock,
        categoryId: category.id,
        sizes: item.sizes,
        colors: item.colors,
        viewsCount: Math.floor(Math.random() * 250) + 50,
        purchasedCount: Math.floor(Math.random() * 60) + 10,
        wishlistedCount: Math.floor(Math.random() * 40) + 5,
        colorHarmonies: item.colors.concat(["Off-White", "Cream", "Black", "Charcoal", "Grey", "White", "Navy"]).slice(0, 5),
        sustainabilityScore: Math.floor(Math.random() * 18) + 80,
        ecoBadges: [
          item.name.toLowerCase().includes("linen") ? "100% Organic Linen" : item.name.toLowerCase().includes("cotton") ? "Supima Organic Cotton" : "Recycled Fine Wool",
          "Low Water Footprint",
          "Carbon-Neutral Logistics"
        ],
        returnRisk: Math.random() > 0.7 ? "Medium" : "Low",
      },
    });

    for (let i = 0; i < item.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.images[i],
          isPrimary: i === 0,
        },
      });
    }
  }

  console.log(`Created ${productsData.length} products.`);

  // Create initial reviews for some products
  const dbProducts = await prisma.product.findMany();
  if (dbProducts.length >= 2) {
    await prisma.review.create({
      data: {
        userId: shopper.id,
        productId: dbProducts[0].id,
        rating: 5,
        comment: "Absolutely stunning coat! The cashmere quality is premium and details are perfect.",
      },
    });

    await prisma.review.create({
      data: {
        userId: shopper.id,
        productId: dbProducts[1].id,
        rating: 4,
        comment: "Excellent structure and fit. A bit stiff at first but looks great.",
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
