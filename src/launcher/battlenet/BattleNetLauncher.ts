import fs from 'fs';
import Protobuf from 'protobufjs';
import * as Path from 'path';
import { Apps, conf } from './raw';
import { GameLauncher } from '../../class/GameLauncher';
import { IGame, IGameImage, IRunGame, Launcher } from '../../lib';
import RunGame from '../../class/RunGame';

export type BattleNetLauncherProps = Partial<{
  configPath: string;
  imgPath: string;
}>;

export type BattleNetGameRaw = {
  path: string | null;
};
export type BattleNetGame = IGame<BattleNetGameRaw>;

export class BattleNetLauncher extends GameLauncher<BattleNetGameRaw> {
  decoder: Protobuf.Type;

  data: any;

  path: string;

  imgPath: string;

  buffer: Buffer | null = null;

  constructor(config?: BattleNetLauncherProps) {
    super({
      name: Launcher.BATTLE_NET,
      os: ['win32'],
      hasShop: false,
      canInstall: false,
    });
    const proot = Protobuf.Root.fromJSON(conf);
    this.decoder = proot.lookupType('Database');
    this.path =
      config?.configPath || 'C:\\ProgramData\\Battle.net\\Agent\\product.db';
    this.imgPath =
      config?.imgPath ?? Path.join(__dirname, '..', '..', '..', 'res', 'bnet');
  }

  async getGameImageBase64(game: BattleNetGame): Promise<IGameImage> {
    return {
      portrait: await this.getInstallationImg(game.key),
    };
  }

  async getGames(): Promise<IRunGame<BattleNetGameRaw>[]> {
    const games = this.getProducts(true);
    const out: IRunGame<BattleNetGameRaw>[] = [];
    for (const g of games) {
      out.push(
        new RunGame(
          {
            key: g,
            name: this.getInstallationName(g) || g,
            installed: true,
            wishList: false,
            launcher: this.getName(),
            raw: {
              path: await this.getInstallExe(g),
            },
          },
          this
        )
      );
    }
    return out;
  }

  async init(): Promise<void> {
    await this.decode();
  }

  async getLaunchGameCMD(game: BattleNetGame): Promise<string | null> {
    return game.raw.path;
  }

  async getOpenShopCMD(): Promise<string | null> {
    return null;
  }

  async getLauncherCMD(): Promise<string | null> {
    return null;
  }

  /**
   * USER DEFINED
   */

  async validateLauncher(): Promise<boolean> {
    return this.isDBExist();
  }

  private isDBExist() {
    if (this.path == null) {
      throw new Error('product.db path is null');
    }
    return fs.existsSync(this.path);
  }

  private async decode() {
    if (!this.isDBExist()) {
      throw new Error(`product.db not found at ${this.path}`);
    }
    this.buffer = await fs.promises.readFile(this.path);
    this.data = this.decoder.decode(this.buffer);
  }

  private getProducts(games = true) {
    if (!this.data) {
      throw new Error('You should decode first');
    }
    const t: string[] = [];
    this.data.productInstall.forEach((element: any) => {
      if (!games || this.isGame(element.uid)) {
        t.push(element.uid);
      }
    });
    return t;
  }

  private getInstallPath(uid: string) {
    if (!this.data) {
      throw new Error('You should decode first');
    }
    for (let index = 0; index < this.data.productInstall.length; index++) {
      const element = this.data.productInstall[index];
      if (element.uid === uid) {
        return element.settings.installPath;
      }
    }
    return false;
  }

  private isGame(uid: string) {
    return !!Apps[uid];
  }

  private getInstallationName(uid: string) {
    return Apps[uid]?.name || null;
  }

  private async getInstallationImg(uid: string): Promise<string | null> {
    const all = await fs.promises.readFile(
      Path.join(this.imgPath, 'base.json'),
      'utf-8'
    );
    return JSON.parse(all)[uid] || null;
  }

  private async getInstallExe(uid: string) {
    const dat = this.getInstallPath(uid);
    if (!dat) {
      return null;
    }
    const files = await fs.promises.readdir(dat);
    const exe = files.find((file) => file.endsWith('.exe'));
    return exe ? Path.join(dat, exe) : null;
  }
}
