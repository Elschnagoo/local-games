export enum Launcher {
  'STEAM' = 'STEAM',
  'EPIC_GAMES' = 'EPIC',
  'BATTLE_NET' = 'BATTLENET',
  'UPLAY' = 'UPLAY',
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
