import { CMap, CoreLogChannel, CoreLogger } from '@grandlinex/core';
import { GameLauncher } from './GameLauncher';
import { IGame, Launcher } from '../lib';
import RunGame from './RunGame';

/**
 * Local games
 * @class LocalGames
 */
export default class LocalGames extends CoreLogChannel {
  private launcher: CMap<string | Launcher, GameLauncher>;

  /**
   * Creates an instance of LocalGames.
   */
  constructor(logger?: CoreLogger) {
    super('local-games', logger || null);
    this.launcher = new CMap();
  }

  /**
   * Get all games
   */
  async getGames(): Promise<IGame[]> {
    const out: IGame[] = [];
    await Promise.all(
      this.launcher.map(async (value) => {
        out.push(...(await value.getGames()));
      })
    );
    return out;
  }

  /**
   * Get run game
   * @param game
   */
  getRunGame<T extends IGame>(game: T) {
    return new RunGame<T>(game, this.getLauncher(game.launcher)!);
  }

  /**
   * Get launcher open command
   * @param name
   */
  async getLauncherCMD(name: Launcher | string): Promise<string | null> {
    const l = this.getLauncher(name);
    if (!l) {
      return null;
    }
    return l.getLauncherCMD();
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
          if (this.logger) {
            l.setLogger(this.logger);
            l.info('register');
          }

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
