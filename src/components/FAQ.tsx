import React from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { classNames } from "npm/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {question}
            </span>
            <ChevronDownIcon
              className={classNames(
                "h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-400",
                open ? "rotate-180 transform" : ""
              )}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">{answer}</p>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

const FAQ = () => {
  return (
    <div>
      {/* Getting Started Section */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Getting Started with Game Tracker
        </h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            Game Tracker is designed to make logging your board game sessions quick and easy. Here&apos;s how to get started:
          </p>
          <ol className="ml-4 list-decimal space-y-2">
            <li>
              <strong className="text-gray-900 dark:text-white">Join or Create a Game Group:</strong> Game groups allow you to track games with different sets of people. You can be part of multiple groups.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Add Games to Your Collection:</strong> Before starting a session, add the games you own to the collection.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Start Recording Sessions:</strong> After each game night, log who played and how everyone ranked.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">View Your Statistics:</strong> Watch your stats grow as you play more games!
            </li>
          </ol>
        </div>
      </div>

      {/* How to Use Features */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          How to Use Key Features
        </h2>
        <div className="space-y-1">
          <FAQItem
            question="How do I start a new game session?"
            answer="Click 'Start a new game' from the dashboard. Select the game you played from your collection, add all players who participated, enter the final scores or rankings for each player, optionally add any expansions used, add notes if desired, and submit to save the session to your history."
          />
          <FAQItem
            question="How do I add a game to my collection?"
            answer="Go to 'Add a game' from the dashboard and search for your game by name. We have a large database of board games. Select the correct game from the search results and it will automatically be added to your group's collection. You can also mark which players own a copy of the game. If you can't find your game, you can create a custom game entry."
          />
          <FAQItem
            question="How do I view my game history?"
            answer="Click 'History' from the dashboard to browse all completed sessions. You can filter by specific games or players, see who played and their final rankings, view the date each game was played, and click on any session to see full details."
          />
          <FAQItem
            question="Where can I see statistics?"
            answer="Click 'Statistics' from the dashboard to see overall statistics for your group, including win rates and rankings for each player, most played games, high scores for competitive games, performance trends over time, and player-specific stats on your profile page."
          />
          <FAQItem
            question="How do I export my data?"
            answer="Go to 'Export' from the dashboard to download all your game session data as a CSV file. You can then import it into spreadsheet applications, create custom reports and visualizations, or keep a backup of your gaming history."
          />
        </div>
      </div>

      {/* Additional Features */}
      <div className="mb-6 rounded-lg bg-gray-100 p-6 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Additional Features
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <h4 className="font-medium text-gray-900 dark:text-white">
              🌙 Dark Mode
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Toggle between light and dark themes using the moon/sun icon in the navigation bar.
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <h4 className="font-medium text-gray-900 dark:text-white">
              🔄 Switch Groups
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Use the arrows icon in the navigation to switch between different gaming groups.
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <h4 className="font-medium text-gray-900 dark:text-white">
              👤 Player Profiles
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Click &quot;Profile&quot; in the navigation to view your personal stats and achievements.
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <h4 className="font-medium text-gray-900 dark:text-white">
              📱 Mobile Friendly
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Game Tracker works great on mobile devices - log games right at the table!
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h3>
        <div className="space-y-1">
        <FAQItem
          question="How do I invite friends to my game group?"
          answer="Game groups are managed through the admin panel. If you're an admin, you can invite new members by sharing the group invite link or adding them directly from the admin section."
        />
        <FAQItem
          question="Can I edit a game session after it's been recorded?"
          answer="Yes! Click on any session in your history to view its details. From there, you can edit scores, add or remove players, or update other information."
        />
        <FAQItem
          question="How are win percentages calculated?"
          answer="Win percentage is calculated as the number of first-place finishes divided by the total number of games played, multiplied by 100. For games with ties, the win is shared among tied players."
        />
        <FAQItem
          question="Can I track cooperative games?"
          answer="Yes! When recording a cooperative game, you can mark all players with the same position (1 for win, 2 for loss) to indicate the team result."
        />
        <FAQItem
          question="What's the difference between a game and an expansion?"
          answer="Base games can be played standalone, while expansions require a base game. When adding an expansion to a session, it will be linked to the base game in your statistics."
        />
        <FAQItem
          question="Can I delete a game from my collection?"
          answer="Games can be removed from your collection through the game details page. Note that this won't delete any recorded sessions - those are preserved in your history."
        />
        <FAQItem
          question="How do I change my display name or avatar?"
          answer="Your profile information is managed through your account settings. Click on your profile picture in the navigation bar to access account options."
        />
        <FAQItem
          question="Is my data backed up?"
          answer="Yes, all data is automatically saved to our servers. You can also export your data as a CSV file at any time for local backup."
        />
        <FAQItem
          question="Can I be in multiple game groups?"
          answer="Absolutely! You can join as many game groups as you like and switch between them using the switch icon in the navigation bar."
        />
        <FAQItem
          question="How do I create a custom game?"
          answer="If you can't find your game in our database, go to 'Make a custom game' from the dashboard. Enter the game name and details, add player count ranges and estimated playtime. The game will be available for your group to use in sessions just like regular games."
        />
        <FAQItem
          question="How do I report a bug or suggest a feature?"
          answer="We appreciate your feedback! Please reach out to the app administrators or submit feedback through the provided channels."
        />
        </div>
      </div>
    </div>
  );
};

export default FAQ;
