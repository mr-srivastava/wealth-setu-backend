# Drizzle ORM Database Setup

This directory contains the Drizzle ORM configuration for the Wealth Setu backend application.

## Files Structure

```
lib/db/
├── index.ts                    # Database connection setup
├── schema/
│   ├── index.ts               # Main schema exports
│   ├── users.ts               # Users table schema
│   ├── profiles.ts            # Profiles table schema
│   ├── accounts.ts            # Accounts table schema
│   ├── transactions.ts        # Transactions table schema
│   ├── budgets.ts             # Budgets table schema
│   └── goals.ts               # Goals table schema
├── types.ts                   # TypeScript type definitions
├── utils.ts                   # Database utility functions
├── auth-sync.ts               # Supabase auth integration
└── README.md                  # This file
```

## Database Schema

The schema is organized in a modular structure with each table in its own file for better maintainability:

### Schema Organization
- **`schema/index.ts`** - Main exports for all tables and indexes
- **`schema/users.ts`** - Users table (extends Supabase auth)
- **`schema/profiles.ts`** - User profile information
- **`schema/accounts.ts`** - Financial accounts
- **`schema/transactions.ts`** - Financial transactions
- **`schema/budgets.ts`** - Budget tracking
- **`schema/goals.ts`** - Financial goals

### Benefits of Modular Schema
- **Easier maintenance** - Each table is in its own file
- **Better organization** - Clear separation of concerns
- **Team collaboration** - Multiple developers can work on different tables
- **Type safety** - Each table maintains its own types and relationships
- **Scalability** - Easy to add new tables without cluttering one file

The application uses the following tables:

### Users
- Extends Supabase auth.users
- Stores basic user information
- Indexed by email for fast lookups

### Profiles
- Additional user profile information
- One-to-one relationship with users
- Includes bio, website, location, phone, date of birth

### Accounts
- Financial accounts (savings, checking, investment, etc.)
- Stores balance, currency, institution information
- Supports metadata for additional account-specific data

### Transactions
- Financial transactions linked to accounts
- Supports income, expense, and transfer types
- Includes categorization, tags, and metadata

### Budgets
- Budget tracking with periods (monthly, yearly)
- Category-based budgeting
- Active/inactive status management

### Goals
- Financial goals with target amounts
- Progress tracking
- Target date support

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Existing Supabase auth variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database connection for Drizzle
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Available Scripts

```bash
# Generate migration files
npm run db:generate

# Push schema to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio
npm run db:studio

# Check schema
npm run db:check

# Drop all tables (dangerous!)
npm run db:drop
```

## Usage Examples

### Basic User Operations

```typescript
import { getUserByEmail, createUser, updateUser } from '@/lib/db/utils';

// Get user by email
const user = await getUserByEmail('user@example.com');

// Create new user
const newUser = await createUser({
  email: 'newuser@example.com',
  fullName: 'John Doe',
});

// Update user
await updateUser(userId, { fullName: 'Jane Doe' });
```

### Account Management

```typescript
import { getAccountsByUserId, createAccount } from '@/lib/db/utils';

// Get user's accounts
const accounts = await getAccountsByUserId(userId);

// Create new account
const account = await createAccount({
  userId,
  name: 'Main Savings',
  type: 'savings',
  balance: '1000.00',
  currency: 'USD',
  institution: 'Bank of America',
});
```

### Transaction Tracking

```typescript
import { createTransaction, getTransactionsByUserId } from '@/lib/db/utils';

// Create transaction
const transaction = await createTransaction({
  accountId,
  amount: '50.00',
  type: 'expense',
  category: 'Food',
  description: 'Grocery shopping',
  date: new Date(),
});

// Get user's transactions
const transactions = await getTransactionsByUserId(userId);
```

## Integration with Supabase Auth

The `auth-sync.ts` file provides utilities to sync Supabase authentication users with the Drizzle database:

```typescript
import { syncUserFromSupabase } from '@/lib/db/auth-sync';

// Sync user from Supabase auth to database
const user = await syncUserFromSupabase(supabaseUserId);
```

## Testing

Run the database test script:

```bash
npx tsx scripts/test-db.ts
```

## Drizzle Studio

Open Drizzle Studio to view and manage your database:

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:4983` where you can:
- Browse tables and data
- Execute queries
- View schema structure
- Manage migrations 