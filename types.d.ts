import { Buffer } from "node:buffer";

export interface AppInfo {
  name: string;
  headerImage: string;
  url: string;
  map: string;
  mapSize: number;
  wipeTime: number;
  players: number;
  maxPlayers: number;
  seed: number;
  logoImage: string;
  nexus: string;
  nexusZone: string;
}

interface Monument {
  token: string;
  x: number;
  y: number;
}

export interface AppMap {
  monuments: Monument[];
  width: number;
  height: number;
  jpgImage: Buffer;
  oceanMargin: number;
  background: string;
}

interface SteamId {
  low: number;
  high: number;
  unsigned: boolean;
}

interface Member {
  steamId: SteamId;
  name: string;
  x: number;
  y: number;
  spawnTime?: number;
  isAlive?: boolean;
  deathTime?: number;
}

interface Note {
  x: number;
  y: number;
  type?: number;
}

interface AppTeamInfo {
  members: Member[];
  mapNotes: Note[];
  leaderMapNotes: Note[];
  leaderSteamId: SteamId;
}

type AppTeamMessage = {
  steamId: {
    low: number;
    high: number;
    unsigned: boolean;
  };
  name: string;
  message: string;
  color: string;
  time: number;
};

type AppNewTeamMessage = {
  message: AppTeamMessage;
};

type AppBroadcast = {
  teamMessage?: AppNewTeamMessage;
};


type Vector4 = {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  
  // Type for a SellOrder, which holds information about the items for sale
  type SellOrder = {
    itemId: number;
    quantity: number;
    currencyId: number;
    costPerItem: number;
    amountInStock: number;
    itemIsBlueprint: boolean;
    currencyIsBlueprint: boolean;
    itemCondition: number;
    itemConditionMax: number;
  };
  
  // Type for AppMarker, representing map markers with additional attributes like sell orders and location
  export type AppMapMarker = {
    sellOrders: SellOrder[]; // Array of SellOrder objects
    id: number;
    type: number;
    x: number;
    y: number;
    //steamId: any; // `steamId` can be of any type, but you can refine it later
    rotation: number;
    radius: number;
    color1: Vector4; // Color information
    color2: Vector4; // Color information
    alpha: number;
    name: string;
    outOfStock: boolean;
  };
