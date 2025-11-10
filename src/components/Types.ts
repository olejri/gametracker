
export interface AtlasGame {
    name: string
    min_players: number
    max_players: number
    min_playtime: number
    max_playtime: number
    mechanics: string[]
    categories: string[]
    description: string
    image_url: string
}

export interface Game  {
    id: string
    name: string
    players: string
    playtime: string
    mechanics: string
    categories: string
    description: string
    image_url: string
    isExpansion: boolean
    baseGameId: string | null
}
//{ "id": "chatcmpl-8OOnGDjsKsIXCaXlJ77tX2L3WONIH", "object": "chat.completion", "created": 1700825870, "model": "gpt-4-1106-preview", "choices": [ { "index": 0, "message": { "role": "assistant", "content": "{\n \"name\": \"Settlers of Catan\",\n \"min_players\": 3,\n \"max_players\": 4,\n \"min_playtime\": 60,\n \"max_playtime\": 120,\n \"mechanics\": [\n \"Dice Rolling\",\n \"Modular Board\",\n \"Trading\",\n \"Resource Gathering\",\n \"Development\"\n ],\n \"categories\": [\n \"Strategy\",\n \"Economic\",\n \"Negotiation\",\n \"Exploration\"\n ],\n \"description\": \"In Settlers of Catan, players try to be the dominant force on the island of Catan by building settlements, cities, and roads. On each turn dice are rolled to determine what resources the island produces. Players collect these resources (cards)—wood, grain, brick, sheep, or stone—to build up their civilizations. Trade between players is a key aspect of the gameplay. The first player to reach 10 victory points wins the game.\"\n}" }, "finish_reason": "stop" } ], "usage": { "prompt_tokens": 91, "completion_tokens": 204, "total_tokens": 295 }, "system_fingerprint": "fp_a24b4d720c" }
export interface OpenaiResponse {
    id: string
    object: string
    created: number
    model: string
    choices: Choice[]
    usage: Usage
    system_fingerprint: string
}

export interface Usage {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
}

export interface Choice {
    index: number
    message: Message
    finish_reason: string
}

interface Message {
    role: string
    content: string
}

export interface DashboardProps {
    groupName: string
}

export interface GameSessionProps {
    groupName: string
    gameId: string
}


export interface AtlasResponse {
    games: AtlasGame[]
    count: number
}

export interface CategoriesResponse {
    categories: Category[]
}

export interface Category {
    name?: string
    id: string
}

export interface MechanicsResponse {
    mechanics: Mechanic[]
}

export interface Mechanic {
    name?: string
    id: string
}

export type Player = {
    id: string;
    name: string;
    nickname?: string | null;
    clerkId?: string | null;
    groupId?: string | null;
};

export type GetPlayerInput = {
    clerkId: string;
};

export type GetPlayerOutput = {
    data: Player;
};

export type PlayerWithScore = {
    playerId: string;
    position: number;
    score: string;
};

export type RecordedSession = {
    players: PlayerWithScore[];
    gameName: string;
    expansionNames: string[];
    groupId: string
    status: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export type PlayerNicknameAndScore = {
    nickname: string;
    clerkId: string;
    position: number;
    score: string;
    playerId: string;
    junctionId: string;
    profileImageUrl: string;
};

export type Expansions = {
    gameId: string,
    gameName: string,
    image_url: string,
}

export type GameSessionWithPlayers = {
    sessionId: string
    baseGameId: string
    gameName: string
    image_url: string
    description?: string
    players: PlayerNicknameAndScore[]
    expansions: Expansions[]
    createdAt: Date
    status: GameSessionStatus
    groupId: string
}

export enum GameSessionStatus {
    Ongoing = "Ongoing",
    Completed = "Completed",
    Cancelled = "Cancelled"
}

export type SearchItem = {
    id: string,
    name: string
}

export type SearchItemProps = {
    title: string | null,
    placeholder: string,
    items: SearchItem[],
    selectedItem: string,
    setSelectedItem: (item: string) => void
}

export type OpenWithGameId = {
    name: string
    open: boolean
}

export type AchievementTypeCounter = {
    name: string,
    achievementNumber: number,
    goal: number,
    score: number,
    fulfilled: boolean,
    description: string,
    gameName?: string,
}

export type ClerkInvite = {
    object: string;
    id: string;
    email_address: string;
    public_metadata: { [key: string]: never };
    revoked: boolean;
    status: string;
    created_at: number;
    updated_at: number;
};

export type GameStatsResult = {
    gameName: string,
    numberOfGamesPlayed: number,
    numberOfFirstPlaceWins: number,
    numberOfSecondPlaceWins: number,
    numberOfThirdPlaceWins: number,
    winPrecentage: number,
}

export type GameHighScore = {
    gameName: string,
    highScore: number,
    playerName: string,
}

export type BestGamePerPlayer = {
    playerName: string;
    bestGame: string;
    weightedWinRate: number;
    gamesPlayed: number;
    avgPosition: number;
    confidenceScore: number;
}

export type GameOwedByPlayers = {
    gameName: string,
    ownedByPlayers: string[]
}

export type GameWithOwners = {
    id: string
    name: string
    players: string
    playtime: string
    mechanics: string
    categories: string
    description: string
    image_url: string
    isExpansion: boolean
    baseGameId: string | null
    ownedByPlayers: string[]
}