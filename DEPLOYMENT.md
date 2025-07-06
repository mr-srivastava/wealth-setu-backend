# Deployment Guide

## Environment Variables Setup

### Development
- Use `.env.local` for local development
- This file is automatically ignored by git
- Contains sensitive information like database passwords

### Production Deployment

#### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following environment variables:
   ```
   DATABASE_URL=postgresql://postgres.bhizwuecsveqkanstuqk:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://bhizwuecsveqkanstuqk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

#### For Other Platforms:
- **Railway**: Add environment variables in the Railway dashboard
- **Netlify**: Add environment variables in Site settings → Environment variables
- **AWS/GCP/Azure**: Use their respective environment variable management systems

### Database Migrations in Production

#### Option 1: Run migrations during build (Recommended)
Add this to your `package.json` scripts:
```json
{
  "scripts": {
    "build": "npm run db:migrate && next build",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

#### Option 2: Run migrations manually
```bash
# After deployment, run migrations manually
npm run db:migrate
```

### Environment Variable Priority
1. **Production**: Uses environment variables set in deployment platform
2. **Development**: Uses `.env.local` file
3. **Fallback**: Uses `.env` file (if exists)

### Security Notes
- Never commit `.env.local` or any files containing real passwords
- Use different database credentials for development and production
- Rotate database passwords regularly
- Use environment-specific Supabase projects if possible 