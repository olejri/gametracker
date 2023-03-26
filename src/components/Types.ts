export interface DataFromClerk {
    name: string;
}

export interface AtlasGame {
    name: string
    min_players: number
    max_players: number
    min_playtime: number
    max_playtime: number
    mechanics: Mechanic[]
    categories: Category[]
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
    clerkId: string;
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
    updatedAt: Date
    status: GameSessionStatus
    groupId: string
}

export enum GameSessionStatus {
    Ongoing = "Ongoing",
    Completed = "Completed",
    Cancelled = "Cancelled"
}

