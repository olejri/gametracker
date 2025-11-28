import React, { useState } from "react";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import {
  ChevronDownIcon,
  PlayIcon,
  PuzzlePieceIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { type DashboardProps } from "npm/components/Types";
import { classNames } from "npm/lib/utils";

interface TutorialSectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const TutorialSection: React.FC<TutorialSectionProps> = ({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = false,
}) => {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className="mb-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <Disclosure.Button className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center">
              <span className={classNames("mr-3 rounded-lg p-2", iconColor)}>
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <ChevronDownIcon
              className={classNames(
                "h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-400",
                open ? "rotate-180 transform" : ""
              )}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-6 pb-6">
            {children}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

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

const Tutorial = ({ groupName }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<"guide" | "faq">("guide");

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Game Tracker
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Game Tracker helps you record, organize, and analyze your board game
          sessions with friends. Track wins, view statistics, and maintain a
          complete history of all your gaming experiences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("guide")}
            className={classNames(
              "py-4 px-1 text-sm font-medium",
              activeTab === "guide"
                ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            User Guide
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={classNames(
              "py-4 px-1 text-sm font-medium",
              activeTab === "faq"
                ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            FAQ
          </button>
        </nav>
      </div>

      {activeTab === "guide" ? (
        <div className="space-y-4">
          {/* Getting Started */}
          <TutorialSection
            title="Getting Started"
            icon={PlayIcon}
            iconColor="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            defaultOpen={true}
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Game Tracker is designed to make logging your board game sessions
                quick and easy. Here&apos;s how to get started:
              </p>
              <ol className="ml-4 list-decimal space-y-2">
                <li>
                  <strong>Join or Create a Game Group:</strong> Game groups allow
                  you to track games with different sets of people. You can be
                  part of multiple groups.
                </li>
                <li>
                  <strong>Add Games to Your Collection:</strong> Before starting a
                  session, add the games you own to the collection.
                </li>
                <li>
                  <strong>Start Recording Sessions:</strong> After each game
                  night, log who played and how everyone ranked.
                </li>
                <li>
                  <strong>View Your Statistics:</strong> Watch your stats grow as
                  you play more games!
                </li>
              </ol>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 Getting Started Illustration
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Start a New Game */}
          <TutorialSection
            title="Start a New Game"
            icon={PlayIcon}
            iconColor="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Recording a game session is the core feature of Game Tracker.
                Here&apos;s how to do it:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  Click{" "}
                  <Link
                    href={`/${groupName}/session/create`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    &quot;Start a new game&quot;
                  </Link>{" "}
                  from the dashboard
                </li>
                <li>Select the game you played from your collection</li>
                <li>Add all players who participated in the session</li>
                <li>Enter the final scores or rankings for each player</li>
                <li>
                  Optionally, add any expansions used during the game session
                </li>
                <li>
                  Add a description or notes about the game (optional)
                </li>
                <li>Submit to save the session to your history</li>
              </ul>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 New Game Session Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Add a Game */}
          <TutorialSection
            title="Add a Game"
            icon={PuzzlePieceIcon}
            iconColor="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Before you can log a session, you need to have the game in your
                collection. To add a new game:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  Go to{" "}
                  <Link
                    href={`/${groupName}/games/search`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    &quot;Add a game&quot;
                  </Link>{" "}
                  from the dashboard
                </li>
                <li>
                  Search for your game by name - we have a large database of
                  board games
                </li>
                <li>
                  Select the correct game from the search results
                </li>
                <li>
                  The game will automatically be added to your group&apos;s
                  collection
                </li>
                <li>
                  You can also mark which players own a copy of the game
                </li>
              </ul>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Can&apos;t find your game? You can
                  create a custom game entry if your game isn&apos;t in our
                  database.
                </p>
              </div>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 Add Game Search Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Game Collection */}
          <TutorialSection
            title="Game Collection"
            icon={Square3Stack3DIcon}
            iconColor="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                The game collection shows all games available in your group.
                Here you can:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  View all games in your{" "}
                  <Link
                    href={`/${groupName}/games/collection`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    collection
                  </Link>
                </li>
                <li>See game details including player count and playtime</li>
                <li>View which players own each game</li>
                <li>
                  See expansions associated with base games
                </li>
                <li>Filter and search through your collection</li>
              </ul>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 Game Collection Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* History */}
          <TutorialSection
            title="History"
            icon={CircleStackIcon}
            iconColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                The history page shows all your completed game sessions. You
                can:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  Browse all completed sessions in your{" "}
                  <Link
                    href={`/${groupName}/history/all`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    history
                  </Link>
                </li>
                <li>Filter by specific games or players</li>
                <li>See who played and their final rankings</li>
                <li>View the date each game was played</li>
                <li>Click on any session to see full details</li>
              </ul>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 History Page Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Statistics */}
          <TutorialSection
            title="Statistics"
            icon={ChartPieIcon}
            iconColor="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Track your gaming performance with detailed statistics. The
                stats page shows:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  Overall{" "}
                  <Link
                    href={`/${groupName}/stats/all`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    statistics
                  </Link>{" "}
                  for your group
                </li>
                <li>Win rates and rankings for each player</li>
                <li>Most played games</li>
                <li>High scores for competitive games</li>
                <li>Performance trends over time</li>
                <li>Player-specific stats on your profile page</li>
              </ul>

              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>🏆 Pro tip:</strong> Check your profile page to see
                  your personal stats, including your best games and win
                  percentage per game!
                </p>
              </div>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 Statistics Dashboard Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Export */}
          <TutorialSection
            title="Export"
            icon={ArrowDownTrayIcon}
            iconColor="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Need to backup your data or analyze it elsewhere? The export
                feature allows you to:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  <Link
                    href={`/${groupName}/export`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Export
                  </Link>{" "}
                  all your game session data
                </li>
                <li>Download as a CSV file</li>
                <li>Import into spreadsheet applications</li>
                <li>Create custom reports and visualizations</li>
                <li>Keep a backup of your gaming history</li>
              </ul>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 Export Feature Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Custom Games */}
          <TutorialSection
            title="Custom Games"
            icon={PlusIcon}
            iconColor="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          >
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Can&apos;t find your game in our database? No problem! You can
                create custom game entries:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  Go to{" "}
                  <Link
                    href={`/${groupName}/games/make-custom`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    &quot;Make a custom game&quot;
                  </Link>
                </li>
                <li>Enter the game name and details</li>
                <li>
                  Add player count ranges and estimated playtime
                </li>
                <li>
                  The game will be available for your group to use in sessions
                </li>
                <li>
                  Custom games work just like regular games for tracking
                </li>
              </ul>

              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>✨ Note:</strong> Custom games are created using AI to
                  help fill in details. You can also manually add game
                  information if preferred.
                </p>
              </div>

              {/* Placeholder for illustration */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📸 Custom Game Creation Screenshot
                </p>
              </div>
            </div>
          </TutorialSection>

          {/* Additional Features */}
          <div className="mt-8 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Additional Features
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  🌙 Dark Mode
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Toggle between light and dark themes using the moon/sun icon
                  in the navigation bar.
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  🔄 Switch Groups
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Use the arrows icon in the navigation to switch between
                  different gaming groups.
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  👤 Player Profiles
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Click &quot;Profile&quot; in the navigation to view your personal stats
                  and achievements.
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  📱 Mobile Friendly
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Game Tracker works great on mobile devices - log games right
                  at the table!
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FAQ Section */
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
              question="How do I report a bug or suggest a feature?"
              answer="We appreciate your feedback! Please reach out to the app administrators or submit feedback through the provided channels."
            />
          </div>
        </div>
      )}

      {/* Back to Dashboard */}
      <div className="mt-8">
        <Link
          href={`/${groupName}/dashboard`}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Tutorial;
