import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth-helper";

// Helper to generate slugs
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters & Pagination
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "99999");
    const sizes = searchParams.getAll("size"); // Can pass multiple ?size=S&size=M
    const colors = searchParams.getAll("color"); // Can pass multiple ?color=Black
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const status = searchParams.get("status") || "ACTIVE"; // ACTIVE, DRAFT, ALL (admin only)

    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {};

    // For regular users, enforce ACTIVE status
    if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (minPrice || maxPrice) {
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (sizes.length > 0) {
      where.sizes = {
        hasSome: sizes,
      };
    }

    if (colors.length > 0) {
      where.colors = {
        hasSome: colors,
      };
    }

    // Build ordering
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "name-asc") {
      orderBy = { name: "asc" };
    }

    // Run queries in parallel
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, stock, categoryId, sizes, colors, images, status } = body;

    if (!name || !description || price === undefined || stock === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug = slugify(name);
    
    // Ensure unique slug
    const existingProduct = await db.product.findUnique({
      where: { slug },
    });

    const finalSlug = existingProduct ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const product = await db.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        sizes: sizes || [],
        colors: colors || [],
        status: status || "ACTIVE",
        images: {
          create: (images || []).map((imgUrl: string, idx: number) => ({
            url: imgUrl,
            isPrimary: idx === 0,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
