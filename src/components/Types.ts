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
}

export interface DashboardProps {
    name: string
    slug: string
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