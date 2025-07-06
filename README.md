# Wealth Setu Backend

A comprehensive wealth management analytics dashboard built with Next.js, Supabase, and Drizzle ORM. This application provides detailed insights into financial transactions, commission tracking, and partner performance analytics.

## 🚀 Features

### Analytics Dashboard
- **Overview Cards**: Key metrics and commission statistics
- **Recent Commissions**: Latest transaction entries and trends
- **Partner Analytics**: Performance tracking for different financial partners
- **Product Type Analysis**: Categorized financial product insights
- **Performance Metrics**: Monthly trends and growth analysis

### Data Management
- **Entity Management**: Track financial institutions and partners (ICICI, Kotak, etc.)
- **Transaction Tracking**: Monthly commission and transaction amounts
- **User Management**: Secure authentication and user profiles
- **Budget & Goals**: Financial planning and goal tracking

### Technical Features
- **Real-time Analytics**: Live data updates and insights
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Dark/Light Theme**: Theme switching capability
- **Secure Authentication**: Supabase-based user authentication
- **Database Migrations**: Automated schema management with Drizzle

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL with Supabase
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth with SSR support
- **Charts**: Recharts for data visualization
- **State Management**: TanStack Query for server state
- **Validation**: Zod for schema validation

## 📁 Project Structure

```
wealth-setu-backend/
├── app/                    # Next.js app router pages
│   ├── analytics/         # Analytics dashboard pages
│   ├── api/              # API routes
│   ├── performance/      # Performance tracking
│   ├── partners/         # Partner management
│   ├── reports/          # Reporting features
│   └── settings/         # User settings
├── components/           # React components
│   ├── analytics/        # Analytics-specific components
│   ├── performance/      # Performance components
│   └── ui/              # Reusable UI components
├── lib/                 # Utility libraries
│   ├── db/             # Database configuration and schemas
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Helper functions
└── scripts/            # Database and data management scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wealth-setu-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```
   
   Required environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_connection_string
   ```

4. **Set up the database**
   ```bash
   # Generate and run migrations
   npm run db:generate
   npm run db:migrate
   
   # Or push schema directly (for development)
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses the following main tables:

- **users**: User authentication and profiles
- **entities**: Financial institutions and partners
- **entity_types**: Categories of financial entities
- **entity_transactions**: Monthly transaction amounts
- **transactions**: General transaction records
- **budgets**: Budget planning data
- **goals**: Financial goal tracking

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (includes database migration)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes directly
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:check` - Check database schema
- `npm run db:drop` - Drop database schema

## 📈 Data Import

The project includes scripts for importing financial data:

- `scripts/import-financial-data.ts` - Import data from CSV files
- `scripts/check-current-data.ts` - Verify imported data
- `scripts/fix-commission-amounts.ts` - Data correction utilities

## 🎨 UI Components

Built with shadcn/ui components including:
- Cards, Tables, and Charts
- Navigation and Sidebar
- Forms and Inputs
- Alerts and Notifications
- Theme switching

## 🔐 Authentication

Uses Supabase Auth with:
- Password-based authentication
- Session management with cookies
- Protected routes
- User profile management

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
