import fs from 'fs';
import { platform } from 'process';
import Path from 'path';
import { homedir } from 'os';
import { CMap } from '@grandlinex/core';
import { GameLauncher } from '../../class/GameLauncher';
import { IGame, IGameImage, Launcher } from '../../lib';
import parse from './VDF';
import NodeCon, { ConHandle } from '../../class/NodeCon';
import BaseImg from '../../util/BaseImg';
import RunGame from '../../class/RunGame';

export type SteamLauncherProps = Partial<{
  configPath: string;
  steamID: string;
}> & {
  apiKey: string;
  steamVanity: string;
};

export type SteamWish = {
  name: string;
  capsule: string;
  review_score: number;
  review_desc: string;
  reviews_total: string;
  reviews_percent: number;
  release_date: string;
  release_string: string;
  platform_icons: string;
  subs: {
    packageid: number;
    bundleid: any;
    discount_block: string;
    discount_pct: any;
    price: string;
  }[];
  type: string;
  screenshots: string[];
  review_css: string;
  priority: number;
  added: number;
  background: string;
  rank: number;
  tags: string[];
  is_free_game: false;
  deck_compat: string;
  early_access: number;
  win: number;
};
export type SteamGameRaw = {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  playtime_windows_forever: number;
  playtime_mac_forever: number;
  playtime_linux_forever: number;
  rtime_last_played: number;
  content_descriptorids: number[];
  playtime_disconnected: number;
};

export type WishMap = CMap<string, SteamWish>;

export type BaseResponse<X> = {
  response: X;
};

export function isSteamGame(
  inp: SteamGameRaw | SteamWish
): inp is SteamGameRaw {
  return (inp as SteamGameRaw).appid !== undefined;
}

export type SteamGame = SteamGameRaw | SteamWish;

export class SteamLauncher extends GameLauncher<SteamGame> {
  static win32 = 'C:\\Program Files (x86)\\Steam';

  static linux = Path.join(homedir(), '.steam', 'steam');

  static darwin = Path.join(
    homedir(),
    'Library',
    'Application Support',
    'Steam'
  );

  private basePath: string;

  private configPath: string;

  private libFile: string;

  private baseApi = 'https://api.steampowered.com';

  private apiKey: string;

  private con: ConHandle;

  private steamID: string | null;

  private steamVanity: string | null;

  constructor(config: SteamLauncherProps) {
    super({
      name: Launcher.STEAM,
      os: ['win32', 'linux', 'darwin'],
      hasShop: true,
      canInstall: true,
    });
    if (config.configPath) {
      this.basePath = config.configPath;
    } else {
      switch (platform) {
        case 'win32':
          this.basePath = SteamLauncher.win32;
          break;
        case 'linux':
          this.basePath = SteamLauncher.linux;
          break;
        case 'darwin':
          this.basePath = SteamLauncher.darwin;
          break;
        default:
          throw new Error('No Steam path found');
      }
    }
    this.configPath = Path.join(this.basePath, 'config');
    this.libFile = Path.join(this.configPath, 'libraryfolders.vdf');
    this.con = NodeCon;
    this.steamID = config.steamID || null;
    this.steamVanity = config.steamVanity;
    this.apiKey = config.apiKey;
  }

  async getGameImageBase64(game: IGame<SteamGame>): Promise<IGameImage> {
    const port = await BaseImg.fromUrl(
      this.getImagePortraitURL(game.key),
      false
    );
    return {
      portrait: port,
      fallback: !port
        ? await BaseImg.fromUrl(this.getImageLandscapeURL(game.key), false)
        : null,
      icon: isSteamGame(game.raw)
        ? await BaseImg.fromUrl(
            this.getGameIconURL(game.key, game.raw.img_icon_url),
            false
          )
        : undefined,
    };
  }

  async getGames(): Promise<RunGame<SteamGame>[]> {
    const list: IGame<SteamGame>[] = [];
    const uid = (await this.steamID64())!;
    const local = this.getInsaledGameIDs();
    const g = await this.geApiGames(uid);
    g?.games.forEach((gn) => {
      const appId = gn.appid.toString();
      list.push({
        imgUrl: this.getImagePortraitURL(appId),
        installed: local.includes(appId),
        key: appId,
        launcher: this.getName(),
        name: gn.name,
        raw: gn,
        wishList: false,
      });
    });
    const wish = await this.getWishlist(uid);
    wish?.forEach((w, id) => {
      list.push({
        imgUrl: this.getImagePortraitURL(id),
        installed: false,
        key: id,
        launcher: this.getName(),
        name: w.name,
        raw: w,
        wishList: true,
      });
    });

    return list.map((gl) => new RunGame(gl, this));
  }

  async getLauncherCMD(): Promise<string | null> {
    return 'steam://advertise/';
  }

  async getLaunchGameCMD(game: IGame<SteamGame>): Promise<string | null> {
    return `steam://rungameid/${game.key}`;
  }

  async getOpenShopCMD(game: IGame<SteamGame>): Promise<string | null> {
    return `steam://advertise/${game.key}`;
  }

  init(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async validateLauncher(): Promise<boolean> {
    return this.testLocal() && (await this.steamID64()) !== null;
  }

  /*
   * Private methods
   */
  private testLocal() {
    return (
      fs.existsSync(this.basePath) &&
      fs.statSync(this.basePath).isDirectory() &&
      fs.existsSync(this.configPath) &&
      fs.statSync(this.configPath).isDirectory() &&
      fs.existsSync(this.libFile) &&
      fs.statSync(this.libFile).isFile()
    );
  }

  private getInsaledGameIDs(): string[] {
    if (!this.testLocal()) {
      return [];
    }
    const out: string[] = [];
    const config = parse(fs.readFileSync(this.libFile, 'utf8'));
    Object.keys(config.libraryfolders).forEach((key) => {
      const cur = config.libraryfolders[key];
      if (cur.apps) {
        Object.keys(cur.apps).forEach((id) => {
          out.push(id);
        });
      }
    });
    return out;
  }

  private async steamID64() {
    if (this.steamID) {
      return this.steamID;
    }
    if (!this.steamVanity) {
      this.error('Cannot get steamID64 without steamVanity');
      return null;
    }
    this.log('Getting steamID64 from steamVanity');
    const idRs = await this.getUserIDByUrl(this.steamVanity);
    if (!idRs) {
      throw new Error('Error getting steamID64, vanity url not valid');
    }
    this.steamID = idRs;
    return idRs;
  }

  private getGameIconURL(appid: string, iconHash: string) {
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`;
  }

  private getImagePortraitURL(appid: string) {
    return `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900.jpg`;
  }

  private getImageLandscapeURL(appid: string) {
    return `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`;
  }

  private parameters(list: [string, string][]) {
    const fields = new CMap<string, string>(list);
    return fields.map((v, k) => `${k}=${v}`).join('&');
  }

  private async geApiGames(
    userId?: string
  ): Promise<{ games: SteamGameRaw[]; game_count: number } | null> {
    const q = this.parameters([
      ['key', this.apiKey],
      ['steamid', userId || (await this.steamID64())!],
      ['include_appinfo', 'true'],
      ['include_played_free_games', 'false'],
    ]);
    const url = `${this.baseApi}/IPlayerService/GetOwnedGames/v1?${q}`;
    const r = await this.con.get<BaseResponse<any>>(url);

    return r.data?.response || null;
  }

  private async getWishlist(userId?: string): Promise<WishMap | null> {
    const url = `https://store.steampowered.com/wishlist/profiles/${
      userId || (await this.steamID64())
    }/wishlistdata/?p=0`;
    const r = await this.con.get<any>(url);
    if (r.data?.success === 2) {
      return null;
    }
    const keys = Object.keys(r.data);
    const map = new CMap<string, SteamWish>();
    for (const key of keys) {
      map.set(key, r.data[key]);
    }
    return map || null;
  }

  private async getUserIDByUrl(vUrl: string): Promise<string | null> {
    const q = this.parameters([
      ['key', this.apiKey],
      ['vanityurl', vUrl],
    ]);
    const url = `${this.baseApi}/ISteamUser/ResolveVanityURL/v0001?${q}`;
    const r = await this.con.get<
      BaseResponse<{ steamid: string; success: number }>
    >(url);

    if (r.data && r.data.response.success === 1) {
      return r.data.response.steamid;
    }
    return null;
  }
}
