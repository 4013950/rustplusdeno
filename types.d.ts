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
  jpgImage: Uint8Array;
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
