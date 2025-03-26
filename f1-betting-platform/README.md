# F1 Betting Platform

A comprehensive F1 race-by-race betting platform where you can invite friends to private wagers and bet on placement of racers.

## Features

- **User Authentication**: Register, login, and secure session management
- **F1 Race Data**: Calendar with upcoming and past races, detailed results
- **Betting System**: Place bets on race order, fastest lap, and DNFs
- **Private Wager Groups**: Create groups and invite friends
- **Scoring System**: Automatic calculation based on race results
- **Leaderboards**: Track standings across all races or for specific races
- **Responsive UI**: Works on desktop and mobile with dark/light mode

## Tech Stack

- **Frontend**: Next.js with React
- **Backend**: Cloudflare Workers with D1 Database
- **Authentication**: JWT-based auth with secure password handling
- **Styling**: Tailwind CSS with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```
   JWT_SECRET=your-secure-jwt-secret-key
   ```
4. Initialize the database:
   ```bash
   wrangler d1 execute DB --local --file=migrations/0001_initial.sql
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

## Scoring System

### Base Scoring
- Correct Position: +25 points
- One Position Off: +15 points
- Two Positions Off: +10 points
- Three Positions Off: +5 points
- Driver in Top 10 but Wrong Spot: +2 points

### Bonus Points
- Perfect Podium (Top 3 in exact order): +30 points
- Perfect Top 5 (Exact Order): +50 points
- Perfect Top 10 (Exact Order): +100 points
- Correct Winner: +20 points
- Fastest Lap Prediction: +10 points
- Correct DNF Prediction: +15 points

### Penalty
- Driver Not in Top 10 at All: -5 points

## License

This project is licensed under the MIT License - see the LICENSE file for details.
