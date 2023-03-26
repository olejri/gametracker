import { GameSessionStatus, type PlayerNicknameAndScore } from "npm/components/Types";

export function FindGameSessionStatus(status: string): GameSessionStatus {
switch (status) {
        case "Ongoing":
            return GameSessionStatus.Ongoing;
        case "Completed":
            return GameSessionStatus.Completed;
        case "Cancelled":
            return GameSessionStatus.Cancelled;
        default:
            throw new Error(`Invalid GameSessionStatus: ${status}`);
    }
}

export function sortPlayers(players: PlayerNicknameAndScore[]) {
    return players.sort((a, b) => {
        if (a.position > b.position) {
            return 1;
        }
        if (a.position < b.position) {
            return -1;
        }
        return 0;
    });
}

