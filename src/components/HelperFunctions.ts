import type {
  AtlasGame,
  Category,
  Game,
  Mechanic,
  PlayerNicknameAndScore
} from "npm/components/Types";
import { GameSessionStatus } from "npm/components/Types";
import dayjs from "dayjs";

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

export function gameNightDates() {
  const numbers = [
    1447372800,
    1409702400,
    1422921600,
    1415664000,
    1670889600,
    1402358400,
    1544486400,
    1666656000,
    1673913600,
    1661817600,
    1656374400,
    1399939200,
    1401148800,
    1390262400,
    1675123200,
    1454457600,
    1397520000,
    1678147200,
    1663632000,
    1660608000,
    1669075200,
    1680048000,
    1403568000,
    1676937600,
    1412121600,
    1424131200,
    1447286400,
    1438560000,
    1442880000,
    1441065600,
    1439856000,
    1603152000,
    1478563200,
    1389225600,
    1510012800,
    1467590400,
    1542067200,
    1481673600,
    1511827200,
    1393891200,
    1534204800,
    1653350400,
    1491782400,
    1540944000,
    1382227200,
    1651536000,
    1524528000,
    1552348800,
    1551139200,
    1552953600,
    1525737600,
    1574121600,
    1596499200,
    1537228800,
    1477958400,
    1519689600,
    1576540800,
    1466380800,
    1476144000,
    1547510400,
    1479772800,
    1383264000,
    1646697600,
    1489449600,
    1391472000,
    1580774400,
    1505260800,
    1465171200,
    1484611200,
    1384905600,
    1543276800,
    1453161600,
    1548115200,
    1581984000,
    1528156800,
    1462233600,
    1515456000,
    1647907200,
    1512950400,
    1630972800,
    1592265600,
    1471910400,
    1501545600,
    1571788800,
    1493769600,
    1570060800,
    1555372800,
    1516665600,
    1535414400,
    1629763200,
    1557360000,
    1562112000,
    1554163200,
    1539734400,
    1380585600,
    1565740800,
    1506038400,
    1632787200,
    1649721600,
    1458172800,
    1480982400,
    1395100800,
    1654560000,
    1456790400,
    1488240000,
    1549324800,
    1529971200,
    1572825600,
    1485820800,
    1517875200,
    1594252800,
    1575331200,
    1563408000,
    1560902400,
    1464048000,
    1578960000,
    1487635200,
    1392681600,
    1474934400,
    1636416000,
    1558310400,
    1398729600,
    1523318400,
    1490659200,
    1410912000,
    1599696000,
    1455667200,
    1508803200,
    1583798400,
    1527033600,
    1473724800,
    1502755200,
    1459814400,
    1414454400,
    1445299200,
    1413244800,
    1416873600,
    1437264000,
    1421712000,
    1420502400,
    1408579200,
    1446508800,
    1444089600,
    1447200000,
    1447113600
  ];
  return numbers.map((number) => {
    return dayjs(number * 1000).format("DD.MM.YYYY");
  });
}

export function makeBoardGameAtlasSearchUrl(searchName: string, mechanic: string, category: string) {
  if (searchName.length === 0 && category.length === 0 && mechanic.length > 0) {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&mechanics=${mechanic}&client_id=1rbEg28jEc`;
  } else if (searchName.length === 0 && mechanic.length === 0 && category.length > 0) {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&categories=${category}&client_id=1rbEg28jEc`;
  } else if (searchName.length > 0 && mechanic.length === 0 && category.length === 0) {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&client_id=1rbEg28jEc`;
  } else if (searchName.length === 0 && mechanic.length > 0 && category.length > 0) {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&mechanics=${mechanic}&categories=${category}&client_id=1rbEg28jEc`;
  } else if (searchName.length > 0 && mechanic.length === 0 && category.length > 0) {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&categories=${category}&client_id=1rbEg28jEc`;
  } else if (searchName.length > 0 && mechanic.length > 0 && category.length === 0) {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&mechanics=${mechanic}&client_id=1rbEg28jEc`;
  } else {
    return `https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&mechanics=${mechanic}&categories=${category}&client_id=1rbEg28jEc`;
  }
}

export const isGameInCollection = (game: AtlasGame, collections: Game[]) => {
  return collections.some((collection) => collection.name === game.name);
};

export const isGameAnExpansion = (game: AtlasGame) => {
  let isExpansion = false;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  game.categories.forEach((category: string) => {
    if (category == "Expansion") {
      isExpansion = true;
    }
  });
  return isExpansion;
};