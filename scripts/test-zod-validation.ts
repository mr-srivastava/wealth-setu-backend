import { config } from 'dotenv';
import {
  validateCreateEntityType,
  validateCreateEntity,
  validateCreateEntityTransaction,
  validateAnalyticsApiResponse,
  validateTransactionsApiResponse,
  safeValidateAnalyticsApiResponse,
  safeValidateTransactionsApiResponse,
  formatZodError,
  createValidationError
} from '../lib/validation';
import {
  CreateEntityTypeSchema,
  CreateEntitySchema,
  CreateEntityTransactionSchema,
  AnalyticsApiResponseSchema,
  TransactionsApiResponseSchema
} from '../lib/db/schemas';
import { z } from 'zod';

config({ path: '.env.local' });

async function testZodValidation() {
  console.log('🧪 Testing Zod Validation...\n');

  // Test 1: Valid entity type creation
  console.log('✅ Test 1: Valid entity type creation');
  try {
    const validEntityType = { name: 'Test Entity Type' };
    const result = validateCreateEntityType(validEntityType);
    console.log('   Result:', result);
  } catch (error) {
    console.error('   Error:', error);
  }

  // Test 2: Invalid entity type creation (missing name)
  console.log('\n❌ Test 2: Invalid entity type creation (missing name)');
  try {
    const invalidEntityType = { name: '' };
    const result = validateCreateEntityType(invalidEntityType);
    console.log('   Result:', result);
  } catch (error) {
    console.log('   Expected error:', error instanceof Error ? error.message : error);
  }

  // Test 3: Valid entity creation
  console.log('\n✅ Test 3: Valid entity creation');
  try {
    const validEntity = { 
      name: 'Test Entity',
      typeId: '123e4567-e89b-12d3-a456-426614174000'
    };
    const result = validateCreateEntity(validEntity);
    console.log('   Result:', result);
  } catch (error) {
    console.error('   Error:', error);
  }

  // Test 4: Invalid entity creation (invalid UUID)
  console.log('\n❌ Test 4: Invalid entity creation (invalid UUID)');
  try {
    const invalidEntity = { 
      name: 'Test Entity',
      typeId: 'invalid-uuid'
    };
    const result = validateCreateEntity(invalidEntity);
    console.log('   Result:', result);
  } catch (error) {
    console.log('   Expected error:', error instanceof Error ? error.message : error);
  }

  // Test 5: Valid transaction creation
  console.log('\n✅ Test 5: Valid transaction creation');
  try {
    const validTransaction = {
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      month: '2024-01-15',
      amount: '1000.50'
    };
    const result = validateCreateEntityTransaction(validTransaction);
    console.log('   Result:', result);
  } catch (error) {
    console.error('   Error:', error);
  }

  // Test 6: Invalid transaction creation (invalid amount format)
  console.log('\n❌ Test 6: Invalid transaction creation (invalid amount format)');
  try {
    const invalidTransaction = {
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      month: '2024-01-15',
      amount: 'invalid-amount'
    };
    const result = validateCreateEntityTransaction(invalidTransaction);
    console.log('   Result:', result);
  } catch (error) {
    console.log('   Expected error:', error instanceof Error ? error.message : error);
  }

  // Test 7: Schema introspection
  console.log('\n🔍 Test 7: Schema introspection');
  console.log('   CreateEntityTypeSchema shape:', CreateEntityTypeSchema.shape);
  console.log('   CreateEntitySchema shape:', CreateEntitySchema.shape);
  console.log('   CreateEntityTransactionSchema shape:', CreateEntityTransactionSchema.shape);

  // Test 8: Error formatting
  console.log('\n📝 Test 8: Error formatting');
  try {
    const invalidData = { name: '', typeId: 'invalid' };
    CreateEntitySchema.parse(invalidData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('   Formatted error:', formatZodError(error));
    }
  }

  // Test 9: Safe validation
  console.log('\n🛡️ Test 9: Safe validation');
  const invalidData = { name: '', typeId: 'invalid' };
  const safeResult = safeValidateAnalyticsApiResponse(invalidData);
  console.log('   Safe validation result:', safeResult);

  // Test 10: Custom validation error
  console.log('\n🎯 Test 10: Custom validation error');
  try {
    throw createValidationError('Custom validation failed');
  } catch (error) {
    console.log('   Custom error:', error instanceof Error ? error.message : error);
  }

  console.log('\n🎉 Zod validation tests completed!');
}

// Test schema transformations
async function testSchemaTransformations() {
  console.log('\n🔄 Testing Schema Transformations...\n');

  // Test date transformation
  console.log('📅 Test: Date transformation');
  const dateSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
  });

  const stringDateSchema = dateSchema.transform((data) => ({
    ...data,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString()
  }));

  try {
    const result = stringDateSchema.parse({
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('   Transformed result:', result);
  } catch (error) {
    console.error('   Error:', error);
  }

  // Test conditional validation
  console.log('\n🔀 Test: Conditional validation');
  const conditionalSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.string()
  }).refine((data) => {
    const amount = parseFloat(data.amount);
    if (data.type === 'expense' && amount > 0) {
      return false;
    }
    if (data.type === 'income' && amount < 0) {
      return false;
    }
    return true;
  }, {
    message: "Expense amounts should be negative, income amounts should be positive"
  });

  try {
    const validIncome = conditionalSchema.parse({ type: 'income', amount: '1000' });
    console.log('   Valid income:', validIncome);
  } catch (error) {
    console.error('   Error:', error);
  }

  try {
    const validExpense = conditionalSchema.parse({ type: 'expense', amount: '-500' });
    console.log('   Valid expense:', validExpense);
  } catch (error) {
    console.error('   Error:', error);
  }

  console.log('\n🎉 Schema transformation tests completed!');
}

// Run tests
async function main() {
  try {
    await testZodValidation();
    await testSchemaTransformations();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

main(); 