export enum Launcher {
  'STEAM' = 'steam',
  'EPIC_GAMES' = 'epic_games',
  'BATTLE_NET' = 'battle_net',
}

export interface IGame<G = any> {
  key: string;
  name: string;
  installed: boolean;
  wishList: boolean;
  launcher: Launcher | string;
  imgUrl?: string;
  raw: G;
}

export interface IGameImage {
  portrait: string | null;
  fallback?: string | null;
  icon?: string | null;
}
