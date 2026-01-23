import React from "react";

const WelcomeInfo: React.FC = () => {
  return (
    <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
      <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
        💡 Tips for Using Game Tracker
      </h3>
      <ul className="mt-4 space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Track your sessions:</strong> Log every game you play with friends. Record players, scores, and rankings to build your gaming history.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Build your collection:</strong> Add games from our extensive database or create custom entries for unique games your group plays.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Analyze statistics:</strong> See who&apos;s winning, which games are most popular, and track performance trends over time.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Unlock achievements:</strong> Earn achievements for milestones like winning streaks, playing diverse games, and mastering different mechanics.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Log games immediately:</strong> Record sessions right after playing while details are fresh - it only takes a minute!</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Add session notes:</strong> Include notes about funny moments, house rules, or special circumstances to remember later.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Use on mobile:</strong> Game Tracker works great on mobile devices - log games right at the table during game night.</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span><strong>Export your data:</strong> Download your gaming history as CSV files for backup or custom analysis.</span>
        </li>
      </ul>
    </div>
  );
};

export default WelcomeInfo;
