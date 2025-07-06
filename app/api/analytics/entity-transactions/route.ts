import { NextRequest, NextResponse } from "next/server";
import { getEntityTransactionsByEntityId, createEntityTransaction } from "@/lib/db/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    
    if (entityId) {
      const transactions = await getEntityTransactionsByEntityId(entityId);
      return NextResponse.json(transactions);
    }
    
    return NextResponse.json({ error: "Entity ID is required" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching entity transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, month, amount } = body;
    
    if (!entityId || !month || amount === undefined) {
      return NextResponse.json({ error: "Entity ID, month, and amount are required" }, { status: 400 });
    }

    const transaction = await createEntityTransaction({ entityId, month, amount });
    return NextResponse.json(transaction[0], { status: 201 });
  } catch (error) {
    console.error("Error creating entity transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 