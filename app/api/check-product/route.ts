import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const product = await getProductById(id.toString());
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return only necessary information to check stock
    return NextResponse.json({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      inStock: product.inStock
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}