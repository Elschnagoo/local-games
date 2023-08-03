import { platform } from 'process';
import { IGame, IGameImage, Launcher } from '../lib';

export interface IGameLauncherProps {
  hasShop: boolean;
  name: string | Launcher;
  os: (typeof platform)[];
}

export interface IGameLauncher<T extends IGame = IGame> {
  getGames(): Promise<T[]>;
  getOpenShopCMD(game: T): Promise<string | null>;
  getLaunchGameCMD(game: T): Promise<string | null>;
  getGameImageBase64(game: T, resize: boolean): Promise<IGameImage | null>;
}
export abstract class GameLauncher<T extends IGame = IGame>
  implements IGameLauncher<T>
{
  protected platform: (typeof platform)[];

  protected hasShop: boolean;

  protected name: string | Launcher;

  /**
   *
   * @param conf
   * @protected
   */
  protected constructor(conf?: IGameLauncherProps) {
    this.hasShop = conf?.hasShop || false;
    this.name = conf?.name || '';
    this.platform = conf?.os || [];
  }

  /**
   * Get launcher name
   */
  getName(): string | Launcher {
    return this.name;
  }

  async validate() {
    const os = this.platform.includes(platform);
    const launcher = os && (await this.validateLauncher());
    return {
      os,
      launcher,
      full: os && launcher,
    };
  }

  /**
   * Validate launcher connection
   */
  abstract validateLauncher(): Promise<boolean>;

  /**
   * Initialize launcher connection
   */
  abstract init(): Promise<void>;

  /**
   * Get list of games
   */
  abstract getGames(): Promise<T[]>;

  /**
   * Get lauch game command
   * @param game
   */
  abstract getLaunchGameCMD(game: T): Promise<string | null>;

  /**
   * Launcher can open shop page
   */
  hasShopLink() {
    return this.hasShop;
  }

  /**
   * Get shop game command
   * @param game
   */
  abstract getOpenShopCMD(game: T): Promise<string | null>;

  /**
   * Get game image as base64 webp
   * @param game
   * @param resize resize image to 228x336
   */
  abstract getGameImageBase64(game: T, resize: boolean): Promise<IGameImage>;
}
