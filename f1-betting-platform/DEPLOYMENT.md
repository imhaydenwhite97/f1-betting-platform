# F1 Betting Platform Deployment Guide

This guide will walk you through the steps to deploy your F1 Betting Platform to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Git](https://git-scm.com/) installed on your local machine
3. [Node.js](https://nodejs.org/) (v16 or later) installed on your local machine

## Step 1: Prepare Your Project for Deployment

Before deploying, make sure you have the F1 logo image in your public directory:

1. Create a `public` directory in your project root if it doesn't exist already
2. Download an F1 logo image and save it as `f1-logo.png` in the public directory

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```
JWT_SECRET=your-secure-jwt-secret-key
```

Replace `your-secure-jwt-secret-key` with a strong, random string.

## Step 3: Initialize Git Repository

If you haven't already initialized a Git repository, do so with the following commands:

```bash
git init
git add .
git commit -m "Initial commit"
```

## Step 4: Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project.

### Option 2: Deploy via Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository.

2. Log in to your [Vercel dashboard](https://vercel.com/dashboard).

3. Click "New Project".

4. Import your repository.

5. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next

6. Add the environment variables:
   - JWT_SECRET: your-secure-jwt-secret-key

7. Click "Deploy".

## Step 5: Set Up Database

After deployment, you'll need to set up your database:

1. Go to your project settings in the Vercel dashboard.

2. Navigate to the "Storage" tab.

3. Create a new Vercel Postgres database or connect to an existing one.

4. Once your database is set up, you'll need to run the migrations:
   ```bash
   vercel env pull .env.local
   npx wrangler d1 execute DB --file=migrations/0001_initial.sql
   ```

## Step 6: Verify Deployment

1. Visit your deployed application at the URL provided by Vercel.

2. Test the following functionality:
   - User registration and login
   - Viewing races and race details
   - Creating and joining wager groups
   - Placing bets on races
   - Viewing leaderboards

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Vercel deployment logs for errors.

2. Ensure all environment variables are correctly set.

3. Verify that your database migrations have been applied successfully.

4. If you're having issues with the database, try resetting it and reapplying the migrations.

## Updating Your Deployment

To update your deployed application:

1. Make changes to your code locally.

2. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to your repository or redeploy using the Vercel CLI:
   ```bash
   vercel
   ```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
