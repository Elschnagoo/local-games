import { IGame, IGameImage, IGameLauncher, IRunGame, Launcher } from '../lib';
import { GameLauncher } from './GameLauncher';

export default class RunGame<T = any> implements IGame<T>, IRunGame<T> {
  readonly imgUrl?: string;

  readonly installed: boolean;

  readonly key: string;

  readonly launcher: Launcher | string;

  readonly name: string;

  readonly raw: T;

  readonly wishList: boolean;

  private readonly runLauncher: GameLauncher;

  constructor(g: IGame<T>, runLauncher: GameLauncher<T>) {
    this.imgUrl = g.imgUrl;
    this.installed = g.installed;
    this.key = g.key;
    this.launcher = g.launcher;
    this.name = g.name;
    this.raw = g.raw;
    this.wishList = g.wishList;
    this.runLauncher = runLauncher;
  }

  async getGameImageBase64(resize: boolean): Promise<IGameImage | null> {
    return this.runLauncher.getGameImageBase64(this, resize);
  }

  /**
   * Get game launch command
   */
  async getLaunchGameCMD(): Promise<string | null> {
    return this.runLauncher.getLaunchGameCMD(this);
  }

  /**
   * Get launcher open command
   */
  async getLauncherCMD(): Promise<string | null> {
    return this.runLauncher.getLauncherCMD();
  }

  /**
   * Get shop open command
   */
  async getOpenShopCMD(): Promise<string | null> {
    return this.runLauncher.getOpenShopCMD(this);
  }

  /**
   * Default game command 1.GameCMD > 2.ShpCMD > 3.LauncherCMD
   */
  async defaultCMD(): Promise<string | null> {
    if (this.wishList) {
      return this.getOpenShopCMD();
    }
    if (this.installed || this.runLauncher.canInstall) {
      return this.getLaunchGameCMD();
    }
    return this.getLauncherCMD();
  }

  getRaw(): IGame<T> {
    return {
      imgUrl: this.imgUrl,
      installed: this.installed,
      key: this.key,
      launcher: this.launcher,
      name: this.name,
      raw: this.raw,
      wishList: this.wishList,
    };
  }

  getLauncher(): IGameLauncher<T> {
    return this.runLauncher;
  }
}
