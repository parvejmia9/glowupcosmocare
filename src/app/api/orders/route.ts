import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";

interface OrderItemInput {
  productId: number;
  variantId: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, mobile, address, city, deliveryZone, orderNotes, items } = body as {
      fullName: string;
      mobile: string;
      address: string;
      city: string;
      deliveryZone: "inside_dhaka" | "outside_dhaka";
      orderNotes?: string;
      items: OrderItemInput[];
    };

    if (!fullName?.trim() || !mobile?.trim() || !address?.trim() || !city?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!["inside_dhaka", "outside_dhaka"].includes(deliveryZone)) {
      return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });
    }

    // Fetch delivery charge from settings
    const chargeKey = deliveryZone === "inside_dhaka" ? "delivery_charge_inside" : "delivery_charge_outside";
    const chargeSetting = await prisma.siteSetting.findUnique({ where: { key: chargeKey } });
    const deliveryCharge = chargeSetting ? parseFloat(chargeSetting.value) || (deliveryZone === "inside_dhaka" ? 70 : 120) : deliveryZone === "inside_dhaka" ? 70 : 120;

    // Place order in a transaction with stock validation + decrement
    const order = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateOrderNumber();

      // Validate & collect order items
      let subtotal = 0;
      const orderItems: {
        productId: number;
        variantId: number;
        productName: string;
        size: string;
        unitPrice: number;
        quantity: number;
      }[] = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { select: { name: true, isActive: true } } },
        });

        if (!variant || !variant.product.isActive) {
          throw new Error(`Product variant ${item.variantId} not found or inactive`);
        }

        if (item.quantity <= 0) {
          throw new Error("Invalid quantity");
        }

        if (variant.stockCount < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.product.name} (${variant.size}). Available: ${variant.stockCount}`);
        }

        const unitPrice = variant.discountPrice && variant.discountPrice > 0
          ? variant.discountPrice
          : variant.price;

        subtotal += unitPrice * item.quantity;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: variant.product.name,
          size: variant.size,
          unitPrice,
          quantity: item.quantity,
        });

        // Decrement stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockCount: { decrement: item.quantity } },
        });
      }

      const total = subtotal + deliveryCharge;

      const created = await tx.order.create({
        data: {
          orderNumber,
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          city: city.trim(),
          deliveryZone,
          deliveryCharge,
          subtotal,
          total,
          orderNotes: orderNotes?.trim() || "",
          items: {
            create: orderItems,
          },
        },
      });

      return created;
    });

    return NextResponse.json({ orderNumber: order.orderNumber, orderId: order.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Order failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
