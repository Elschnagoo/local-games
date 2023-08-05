// eslint-disable-next-line import/no-extraneous-dependencies
import { config } from 'dotenv';
import Path from 'path';
import {
  BattleNetLauncher,
  EpicLauncher,
  HtmlUtil,
  IGame,
  Launcher,
  LocalGames,
  SteamLauncher,
  UplayLauncher,
} from '../index';

config();

let lg: LocalGames;

const { EPIC_INSTALL, STEAM_APIKEY, STEAM_VANITY, MAKE_HTML } = process.env;

describe('LocalGames', () => {
  test('create objs', () => {
    lg = new LocalGames();
  });
  test('empty', () => {
    expect(lg.listLaunchers()).toHaveLength(0);
  });
});

describe.each([
  [
    Launcher.EPIC_GAMES,
    new EpicLauncher({
      installPath: EPIC_INSTALL,
    }),
    {
      fallback: false,
      icon: false,
      fileExe: false,
    },
  ],
  [
    Launcher.BATTLE_NET,
    new BattleNetLauncher({}),
    {
      fallback: false,
      icon: false,
      fileExe: true,
    },
  ],
  [
    Launcher.STEAM,
    new SteamLauncher({ apiKey: STEAM_APIKEY!, steamVanity: STEAM_VANITY! }),
    {
      fallback: true,
      icon: true,
      fileExe: false,
    },
  ],
  [
    Launcher.UPLAY,
    new UplayLauncher({ lang: 'de-DE' }),
    {
      fallback: false,
      icon: false,
      fileExe: true,
    },
  ],
])(`Launcher: %s`, (name, launcher, props) => {
  let games: IGame[];
  let game: IGame;
  test('register launcher', async () => {
    const r = await lg.registerLauncher(launcher);
    expect(r.success).toBeTruthy();
  });

  test('get launcher', async () => {
    const l = lg.getLauncher(name);
    expect(l).toBeDefined();
    console.log(l?.getName());
  });
  test('get games', async () => {
    games = await launcher.getGames();
    expect(games.length).toBeGreaterThan(0);
  });
  test('get game image', async () => {
    [game] = games;
    console.log(game);
    expect(game).toBeDefined();
    const img = await launcher.getGameImageBase64(game, true);
    expect(img.portrait).toBeDefined();
    if (img.portrait) {
      console.log('portrait', img.portrait.substring(0, 40));
    }
    if (props.fallback) {
      expect(img.fallback).toBeDefined();
      console.log('fallback', img.fallback?.substring(0, 40));
    } else {
      expect(img.fallback).toBeUndefined();
    }
    if (props.icon) {
      expect(img.icon).toBeDefined();
      console.log('icon', img.icon?.substring(0, 40));
    } else {
      expect(img.icon).toBeUndefined();
    }
  });
  test('get game run cmd', async () => {
    const cmd = await launcher.getLaunchGameCMD(game);
    expect(cmd).toBeDefined();
    console.log(cmd);
  });
  test('get game shop cmd', async () => {
    const cmd = await launcher.getOpenShopCMD(game);
    if (launcher.hasShopLink()) {
      expect(cmd).toBeDefined();
      console.log(cmd);
    } else {
      expect(cmd).toBeNull();
    }
  });
});

describe('full', () => {
  test('list games', async () => {
    expect((await lg.getGames()).length).toBeGreaterThan(0);
  });
  test('make-html', async () => {
    if (MAKE_HTML === 'true') {
      await HtmlUtil.make(lg, Path.join(__dirname, '..', '..', 'test.html'));
    }
  }, 1000000);
});

describe('final', () => {
  test('list launcher', () => {
    expect(lg.listLaunchers()).toHaveLength(4);
  });
});