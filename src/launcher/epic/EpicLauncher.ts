import fs from 'fs';
import Path from 'path';
import { GameLauncher } from '../../class/GameLauncher';
import { IGame, IGameImage, Launcher } from '../../lib';
import BaseImg from '../../util/BaseImg';

export type EpicGameRaw = {
  title: string;
  description: string;
  id: string;
  namespace: string;
  entitlementName: string;
  categories: {
    name: string;
    path: string;
  }[];
  keyImages: {
    type: 'DieselGameBox' | 'DieselGameBoxTall' | string;
    url: string;
    width: number;
    height: number;
    size: number;
    uploadedDate: Date;
    md5: string;
  }[];
  releaseInfo: {
    appId: string;
    compatibleApps: any[];
    platform: string[];
    dateAdded: Date;
  }[];
} & Record<string, any>;

export type EpicGame = IGame<{
  title: string;
  id: string;
  namespace: string;
  appId: string;
}>;

export type EpicLauncherProps = Partial<{
  configPath: string;
  installPath: string;
}>;

function storeUrl(name: string) {
  let url = name.toLowerCase();
  url = url.replace(/\s/g, '-');
  url = url.replace(/[^a-zA-Z0-9-]/g, '');
  return url;
}

export class EpicLauncher extends GameLauncher<EpicGame> {
  path: string;

  installPath: string;

  constructor(props?: EpicLauncherProps) {
    super({
      name: Launcher.EPIC_GAMES,
      os: ['win32'],
      hasShop: true,
      canInstall: true,
    });
    this.path =
      props?.configPath ||
      'C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Catalog\\catcache.bin';
    this.installPath = props?.installPath || 'C:\\Program Files\\Epic Games';
  }

  async getGameImageBase64(
    game: EpicGame,
    resize: boolean
  ): Promise<IGameImage> {
    if (!game.imgUrl) {
      return {
        portrait: null,
      };
    }
    return {
      portrait: await BaseImg.fromUrl(game.imgUrl, resize),
    };
  }

  async getGames(): Promise<EpicGame[]> {
    const list = await this.getJson();
    if (!list) {
      return [];
    }
    const local = await this.getLocalGameList();
    return list
      .filter((x) => {
        const addon = x.categories.find((e) => e.path === 'addons');
        const engines = x.categories.find((e) => e.path === 'engines');
        const game = x.categories.find((e) => e.path === 'games');
        const appId = x.releaseInfo.length > 0;

        return !addon && !engines && game && appId;
      })
      .map<EpicGame>((x) => ({
        key: x.id,
        name: x.title,
        installed: local?.includes(x.id) || false,
        launcher: this.getName(),
        wishList: false,
        imgUrl: x.keyImages.find((e) => e.type === 'DieselGameBoxTall')?.url,
        raw: {
          title: x.title,
          id: x.id,
          namespace: x.namespace,
          appId: x.releaseInfo[0].appId,
        },
      }));
  }

  init(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async getLauncherCMD(): Promise<string | null> {
    return 'com.epicgames.launcher://';
  }

  async getLaunchGameCMD(game: EpicGame): Promise<string | null> {
    if (game.wishList) {
      return null;
    }
    if (game.installed) {
      return `com.epicgames.launcher://apps/${game.raw.namespace}%3A${game.raw.id}%3A${game.raw.appId}?action=launch&silent=true`;
    }
    return `com.epicgames.launcher://apps/${game.raw.namespace}%3A${game.raw.id}%3A${game.raw.appId}?action=install&silent=true`;
  }

  async getOpenShopCMD(game: EpicGame): Promise<string | null> {
    return `com.epicgames.launcher://store/de/p/${storeUrl(game.raw.title)}`;
  }

  async validateLauncher(): Promise<boolean> {
    return fs.existsSync(this.path) && fs.existsSync(this.installPath);
  }

  /* Class funcs */
  private async getJson(): Promise<EpicGameRaw[] | null> {
    try {
      const buffer = await fs.promises.readFile(this.path, 'utf-8');
      const bf = Buffer.from(buffer, 'base64').toString('utf-8');

      return JSON.parse(bf);
    } catch (e) {
      this.error(e);
      return null;
    }
  }

  private async getLocalGameList(): Promise<string[] | null> {
    const list: string[] = [];
    if (
      !fs.existsSync(this.installPath) ||
      !fs.statSync(this.installPath).isDirectory()
    ) {
      this.error('Invalid path');
      return null;
    }
    const files = await fs.promises.readdir(this.installPath);
    for (const file of files) {
      const eFolder = Path.join(this.installPath, file, '.egstore');
      const exist = fs.existsSync(eFolder);
      if (exist && fs.statSync(eFolder).isDirectory()) {
        const meta = await fs.promises.readdir(eFolder);
        const metaFile = meta.find((x) => x.endsWith('.mancpn'));
        if (metaFile) {
          const content = await fs.promises.readFile(
            Path.join(eFolder, metaFile),
            'utf-8'
          );
          const json = JSON.parse(content);
          list.push(json.CatalogItemId);
        }
      }
    }
    return list;
  }
}
