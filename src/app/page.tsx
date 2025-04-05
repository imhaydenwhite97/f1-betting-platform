import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image 
              src="/images/f1-logo.svg" 
              alt="F1 Logo" 
              width={60} 
              height={30} 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">F1 Betting</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth" 
              className="bg-white text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Race-by-Race F1 Betting with Friends
            </h1>
            <p className="text-xl mb-8">
              Create private betting groups, invite friends, and compete to predict race outcomes with our advanced scoring system.
            </p>
            <Link 
              href="/auth" 
              className="bg-white text-red-600 px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-100 inline-block"
            >
              Get Started
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-80 bg-black/20 rounded-lg overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xl font-bold">F1 Race Predictions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">Create or Join Groups</h3>
              <p className="text-gray-600">Create private betting groups and invite your friends to join, or accept invitations to existing groups.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">Place Your Bets</h3>
              <p className="text-gray-600">Predict the finishing order, DNFs, and fastest laps for upcoming races before they start.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">Score Points & Win</h3>
              <p className="text-gray-600">Earn points based on the accuracy of your predictions and compete with friends on the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring System Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Scoring System</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Base Scoring</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex justify-between">
                <span>Correct Position:</span>
                <span className="font-bold">+25 points</span>
              </li>
              <li className="flex justify-between">
                <span>One Position Off:</span>
                <span className="font-bold">+15 points</span>
              </li>
              <li className="flex justify-between">
                <span>Two Positions Off:</span>
                <span className="font-bold">+10 points</span>
              </li>
              <li className="flex justify-between">
                <span>Three Positions Off:</span>
                <span className="font-bold">+5 points</span>
              </li>
              <li className="flex justify-between">
                <span>Driver in Top 10 but Wrong Spot:</span>
                <span className="font-bold">+2 points</span>
              </li>
            </ul>
            
            <h3 className="text-xl font-bold mb-4">Bonus Points</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex justify-between">
                <span>Perfect Podium (Top 3 in exact order):</span>
                <span className="font-bold">+30 points</span>
              </li>
              <li className="flex justify-between">
                <span>Perfect Top 5 (Exact Order):</span>
                <span className="font-bold">+50 points</span>
              </li>
              <li className="flex justify-between">
                <span>Perfect Top 10 (Exact Order):</span>
                <span className="font-bold">+100 points</span>
              </li>
              <li className="flex justify-between">
                <span>Correct Winner:</span>
                <span className="font-bold">+20 points</span>
              </li>
              <li className="flex justify-between">
                <span>Fastest Lap Prediction:</span>
                <span className="font-bold">+10 points</span>
              </li>
              <li className="flex justify-between">
                <span>Correct DNF Prediction:</span>
                <span className="font-bold">+15 points</span>
              </li>
            </ul>
            
            <h3 className="text-xl font-bold mb-4">Penalties</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Driver Not in Top 10 at All:</span>
                <span className="font-bold">-5 points</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Betting?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join now to create your first betting group and invite friends to compete in predicting F1 race outcomes.
          </p>
          <Link 
            href="/auth" 
            className="bg-white text-red-600 px-8 py-4 rounded-md text-lg font-bold hover:bg-gray-100 inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} F1 Betting Platform. All rights reserved.</p>
          <p className="text-sm mt-2 text-gray-400">
            This is a fan-made application and is not affiliated with Formula 1 or FIA.
          </p>
        </div>
      </footer>
    </div>
  );
}
