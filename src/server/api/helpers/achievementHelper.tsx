import { type AchievementTypeCounter } from "npm/components/Types";

//TODO: Move to database
export const getAchievements = (
  maxWins: number,
  bestGame: string,
  numberOfGamesWon: number,

) => {
  const ach1: AchievementTypeCounter = {
    name: "Specialist Apprentice",
    achievementNumber: 1,
    goal: 5,
    score: maxWins,
    fulfilled: maxWins >= 5,
    description: "Win the same game 5 times",
    gameName: bestGame,
  }
  const ach2: AchievementTypeCounter = {
    name: "Specialist Journeyman",
    achievementNumber: 2,
    goal: 10,
    score: maxWins,
    fulfilled: maxWins >= 10,
    description: "Win the same game 10 times",
    gameName: bestGame,
  }
  const ach3: AchievementTypeCounter = {
    name: "Specialist Expert",
    achievementNumber: 3,
    goal: 25,
    score: maxWins,
    fulfilled: maxWins >= 25,
    description: "Win the same game 25 times",
    gameName: bestGame,
  }
  const ach4: AchievementTypeCounter = {
    name: "Specialist Master",
    achievementNumber: 4,
    goal: 50,
    score: maxWins,
    fulfilled: maxWins >= 50,
    description: "Win the same game 50 times",
    gameName: bestGame,
  }

  const ach5: AchievementTypeCounter = {
    name: "Generalist Apprentice",
    achievementNumber: 5,
    goal: 5,
    score: numberOfGamesWon,
    fulfilled: numberOfGamesWon >= 5,
    description: "Win 5 different games",
  }
  const ach6: AchievementTypeCounter = {
    name: "Generalist Journeyman",
    achievementNumber: 6,
    goal: 10,
    score: numberOfGamesWon,
    fulfilled: numberOfGamesWon >= 10,
    description: "Win 10 different games",
  }
  const ach7: AchievementTypeCounter = {
    name: "Generalist Expert",
    achievementNumber: 7,
    goal: 25,
    score: numberOfGamesWon,
    fulfilled: numberOfGamesWon >= 25,
    description: "Win 25 different games",
  }
  const ach8: AchievementTypeCounter = {
    name: "Generalist Master",
    achievementNumber: 8,
    goal: 50,
    score: numberOfGamesWon,
    fulfilled: numberOfGamesWon >= 50,
    description: "Win 50 different games",
  }

  return { ach1, ach2, ach3, ach4, ach5, ach6, ach7, ach8 };
};
