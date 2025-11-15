import React, { useEffect, useState } from "react";
import { SignInButton } from "@clerk/nextjs";

interface RecentGame {
  id: string;
  gameName: string;
  playedAt: Date;
}

export default function LandingPage() {
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Fetch recent games from API
    fetch("/api/recent-games")
      .then((res) => res.json())
      .then((data: RecentGame[]) => {
        setRecentGames(data);
      })
      .catch((error) => {
        console.error("Error fetching recent games:", error);
        // Set fallback data if API fails
        setRecentGames([
          { id: "1", gameName: "Catan", playedAt: new Date() },
          { id: "2", gameName: "Ticket to Ride", playedAt: new Date() },
          { id: "3", gameName: "Pandemic", playedAt: new Date() },
          { id: "4", gameName: "Carcassonne", playedAt: new Date() },
          { id: "5", gameName: "Azul", playedAt: new Date() },
        ]);
      });
  }, []);

  useEffect(() => {
    // Auto-scroll animation every 2.5 seconds
    if (recentGames.length === 0) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % recentGames.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [recentGames.length]);

  return (
    <div className="flex h-screen flex-col bg-gray-800 text-white lg:flex-row">
      {/* Left Side: Intro Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 lg:px-16">
        <div className="max-w-xl">
          <h1 className="mb-6 text-4xl font-bold leading-tight lg:text-5xl">
            Your Scorekeeper for Any Game Night
          </h1>
          <p className="mb-8 text-lg text-gray-300 lg:text-xl">
            Track multiple players, record scores in real time, and settle every
            match with clear standings.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-lg bg-green-500 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-green-600 cursor-pointer">
              Start tracking
            </button>
          </SignInButton>
        </div>
      </div>

      {/* Right Side: Animated Recent Games List */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-900 px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-300">
            Recently Played
          </h2>
          <div className="relative h-80 overflow-hidden rounded-lg bg-gray-800 p-6">
            <div
              className="space-y-4 transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateY(-${scrollPosition * 80}px)`,
              }}
            >
              {recentGames.length > 0 ? (
                recentGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="rounded-lg bg-gray-700 p-4 shadow-lg"
                    style={{
                      opacity: index === scrollPosition ? 1 : 0.6,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-lg font-medium">{game.gameName}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(game.playedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <p>No recent games available</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-center space-x-2">
            {recentGames.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === scrollPosition ? "bg-green-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
