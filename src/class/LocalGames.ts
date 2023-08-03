import {
  CMap,
  CoreLogChannel,
  CoreLogger,
  DefaultLogger,
} from '@grandlinex/core';
import { GameLauncher, IGameLauncher } from './GameLauncher';
import { IGame, IGameImage, Launcher } from '../lib';

/**
 * Local games
 * @class LocalGames
 */
export default class LocalGames
  extends CoreLogChannel
  implements IGameLauncher
{
  private launcher: CMap<string | Launcher, GameLauncher>;

  /**
   * Creates an instance of LocalGames.
   */
  constructor(logger?: CoreLogger) {
    super('local-games', logger || new DefaultLogger());
    this.launcher = new CMap();
  }

  async getGames(): Promise<IGame[]> {
    const out: IGame[] = [];
    await Promise.all(
      this.launcher.map(async (value) => {
        out.push(...(await value.getGames()));
      })
    );
    return out;
  }

  async getOpenShopCMD(game: IGame): Promise<string | null> {
    const l = this.getLauncher(game.launcher);
    if (!l) {
      return null;
    }
    return l.getOpenShopCMD(game);
  }

  async getLaunchGameCMD(game: IGame): Promise<string | null> {
    const l = this.getLauncher(game.launcher);
    if (!l) {
      return null;
    }
    return l.getLaunchGameCMD(game);
  }

  async getGameImageBase64(
    game: IGame,
    resize: boolean
  ): Promise<IGameImage | null> {
    const l = this.getLauncher(game.launcher);
    if (!l) {
      return null;
    }
    return l.getGameImageBase64(game, resize);
  }

  /**
   * Get launcher by name
   * @param name
   */
  getLauncher<T extends GameLauncher>(name: string | Launcher) {
    return this.launcher.get(name) as T | undefined;
  }

  /**
   * Register new launcher
   * @param launcher
   */
  async registerLauncher(...launcher: GameLauncher[]) {
    const res = await Promise.all(
      launcher.map<Promise<[string, boolean, GameLauncher]>>(async (l) => {
        try {
          const r = await l.validate();
          if (!r.full) {
            this.warn(
              `Launcher ${l.getName()} is not valid! os: ${r.os} launcher: ${
                r.launcher
              }`
            );
          }
          return [l.getName(), r.full, l];
        } catch (e) {
          return [l.getName(), false, l];
        }
      })
    );
    await Promise.all(
      res.map(async ([name, valid, l]) => {
        if (valid) {
          this.debug(`Register launcher ${name} valid: ${valid}`);
          await l.init();
          this.launcher.set(name, l);
        }
      })
    );
    return {
      success: !res.find(([, r]) => !r),
      result: res,
    };
  }

  listLaunchers() {
    return this.launcher.toKeyArray();
  }
}
