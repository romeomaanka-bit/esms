# ESMS Web (Next.js)

This folder contains a minimal Next.js frontend scaffold for ESMS.

Quick start (from apps/web):

1. Install dependencies
   npm install

2. Create .env.local (example)
   NEXT_PUBLIC_API_URL=http://localhost:4000

3. Run dev
   npm run dev

Pages included:
- /login — login form
- /admin — admin dashboard (requires admin token)
- /teacher — teacher dashboard (requires teacher token)
- /student — student dashboard (requires student token)

Note: This is a minimal scaffold. Add proper authentication guards, styling, and components as needed.
