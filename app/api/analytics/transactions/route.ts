import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/db/analytics-server';
import { validateCreateEntityTransaction } from '@/lib/validation';
import { createEntityTransaction } from '@/lib/db/utils';
import { z } from 'zod';

export async function GET() {
  try {
    const transactionsData = await getTransactions();
    
    return NextResponse.json({
      success: true,
      data: transactionsData,
      message: 'Transactions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
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
    const validatedData = validateCreateEntityTransaction(body);
    
    // Create the entity transaction
    const result = await createEntityTransaction(validatedData);
    
    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create entity transaction',
          message: 'No transaction was created'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Entity transaction created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating entity transaction:', error);
    
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
        error: 'Failed to create entity transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 