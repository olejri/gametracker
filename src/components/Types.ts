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

export type PlayerNicknameAndScore = {
    nickname: string;
    clerkId: string;
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

export type Expansions = {
    gameName: string,
    image_url: string,
}

export type GameSessionWithPlayers = {
    gameName: string,
    image_url: string,
    description?: string,
    players: PlayerNicknameAndScore[],
    expansions: Expansions[],
    updatedAt: Date,
    status: string,
}

export type OldDataFormat = {
     "createdAt": string,
      "updatedAt": string,
      "gameName": string,
      "status": string,
      "description":string,
      "groupId": string,
      "47cb209e-314f-43b5-be68-7cd971fe2f9a": string,
      "aa6ad37e-8cdb-46f8-a40a-b083920d91a7": string,
      "e8e9450e-5349-4fdb-9a89-b00bd5d8ee83": string,
      "0021cf9f-864e-42ff-bde1-1f6d8b58d750": string,
      "ba629ff2-31af-44b7-8729-25057fea4b40": string,
      "expansionNames": string[],
}
