import { NextRequest, NextResponse } from "next/server";
import { getEntityTypes } from "@/lib/db/analytics-server";
import { validateCreateEntityType } from "@/lib/validation";
import { createEntityType } from "@/lib/db/utils";
import { z } from "zod";

export async function GET() {
  try {
    const entityTypes = await getEntityTypes();
    
    return NextResponse.json({
      success: true,
      data: entityTypes,
      message: 'Entity types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching entity types:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch entity types',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = validateCreateEntityType(body);
    
    // Create the entity type
    const result = await createEntityType(validatedData);
    
    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create entity type',
          message: 'No entity type was created'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Entity type created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating entity type:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create entity type',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 