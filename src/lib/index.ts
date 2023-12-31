export enum Launcher {
  'STEAM' = 'STEAM',
  'EPIC_GAMES' = 'EPIC',
  'BATTLE_NET' = 'BATTLENET',
  'UPLAY' = 'UPLAY',
}
export interface IGameLauncher<T> {
  getGames(): Promise<IRunGame<T>[]>;
  getOpenShopCMD(game: IGame<T>): Promise<string | null>;
  getLaunchGameCMD(game: IGame<T>): Promise<string | null>;
  getGameImageBase64(
    game: IGame<T>,
    resize: boolean
  ): Promise<IGameImage | null>;
  getLauncherCMD(): Promise<string | null>;
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
export interface IRunGame<G = any> extends IGame<G> {
  getGameImageBase64(resize: boolean): Promise<IGameImage | null>;
  getLaunchGameCMD(): Promise<string | null>;
  getLauncherCMD(): Promise<string | null>;
  getOpenShopCMD(): Promise<string | null>;
  defaultCMD(): Promise<string | null>;
  getRaw(): IGame<G>;
  getLauncher(): IGameLauncher<G>;
}

export interface IGameImage {
  portrait: string | null;
  fallback?: string | null;
  icon?: string | null;
}
