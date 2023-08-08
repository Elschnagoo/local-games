import { platform } from 'process';
import { CoreLogChannel, CoreLogger } from '@grandlinex/core';
import { IGame, IGameImage, IGameLauncher, IRunGame, Launcher } from '../lib';

export interface IGameLauncherProps {
  hasShop: boolean;
  canInstall: boolean;
  name: string | Launcher;
  os: (typeof platform)[];
  logger?: CoreLogger;
}

export abstract class GameLauncher<T = any>
  extends CoreLogChannel
  implements IGameLauncher<T>
{
  readonly platform: (typeof platform)[];

  readonly hasShop: boolean;

  readonly canInstall: boolean;

  readonly name: string | Launcher;

  /**
   *
   * @param conf
   * @protected
   */
  protected constructor(conf?: IGameLauncherProps) {
    super(`launcher-${conf?.name || ''}`, conf?.logger || null);
    this.hasShop = conf?.hasShop || false;
    this.canInstall = conf?.canInstall || false;
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
  abstract getGames(): Promise<IRunGame<T>[]>;

  /**
   * Get launcher command
   */
  abstract getLauncherCMD(): Promise<string | null>;

  /**
   * Get lauch game command
   * @param game
   */
  abstract getLaunchGameCMD(game: IGame<T>): Promise<string | null>;

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
  abstract getOpenShopCMD(game: IGame<T>): Promise<string | null>;

  /**
   * Get game image as base64 webp
   * @param game
   * @param resize resize image to 228x336
   */
  abstract getGameImageBase64(
    game: IGame<T>,
    resize: boolean
  ): Promise<IGameImage>;
}
