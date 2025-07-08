import { NextRequest, NextResponse } from "next/server";
import { getLandingPageAnalytics } from "@/lib/db/analytics-server";
import { validateCreateEntity } from "@/lib/validation";
import { createEntity } from "@/lib/db/utils";
import { z } from "zod";

export async function GET() {
  try {
    const analyticsData = await getLandingPageAnalytics();
    return NextResponse.json({
      success: true,
      data: analyticsData,
      message: "Landing page analytics data retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching landing page analytics data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch landing page analytics data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = validateCreateEntity(body);
    
    // Create the entity
    const result = await createEntity(validatedData);
    
    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create entity",
          message: "No entity was created"
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result[0],
      message: "Entity created successfully"
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating entity:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: error.errors.map(e => e.message).join(", ")
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create entity",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 