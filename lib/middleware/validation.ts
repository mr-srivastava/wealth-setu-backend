import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { formatZodError } from '../validation';

// Generic validation middleware
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return await handler(req, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            message: formatZodError(error)
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Failed to parse request body'
        },
        { status: 400 }
      );
    }
  };
}

// Query parameter validation middleware
export function withQueryValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedParams: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const validatedParams = schema.parse(params);
      return await handler(req, validatedParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query parameters',
            message: formatZodError(error)
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Failed to parse query parameters'
        },
        { status: 400 }
      );
    }
  };
}

// Response validation middleware
export function withResponseValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest) => Promise<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const data = await handler(req);
      const validatedData = schema.parse(data);
      
      return NextResponse.json({
        success: true,
        data: validatedData,
        message: 'Data retrieved successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Response validation failed:', formatZodError(error));
        return NextResponse.json(
          {
            success: false,
            error: 'Data validation failed',
            message: 'Response data does not match expected schema'
          },
          { status: 500 }
        );
      }
      
      console.error('Handler error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  };
}

// Combined validation middleware
export function withFullValidation<TBody, TQuery, TResponse>(
  bodySchema: z.ZodSchema<TBody> | null,
  querySchema: z.ZodSchema<TQuery> | null,
  responseSchema: z.ZodSchema<TResponse>,
  handler: (
    req: NextRequest, 
    body: TBody | null, 
    query: TQuery | null
  ) => Promise<TResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let validatedBody: TBody | null = null;
      let validatedQuery: TQuery | null = null;
      
      // Validate body if schema provided
      if (bodySchema) {
        const body = await req.json();
        validatedBody = bodySchema.parse(body);
      }
      
      // Validate query parameters if schema provided
      if (querySchema) {
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams.entries());
        validatedQuery = querySchema.parse(params);
      }
      
      // Execute handler
      const data = await handler(req, validatedBody, validatedQuery);
      
      // Validate response
      const validatedResponse = responseSchema.parse(data);
      
      return NextResponse.json({
        success: true,
        data: validatedResponse,
        message: 'Request processed successfully'
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            message: formatZodError(error)
          },
          { status: 400 }
        );
      }
      
      console.error('Handler error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  };
}

// Error response helper
export function createErrorResponse(
  error: unknown,
  context: string = 'Request processing'
): NextResponse {
  console.error(`${context} error:`, error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        message: formatZodError(error)
      },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Request processed successfully'
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  });
} 