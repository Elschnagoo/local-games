// eslint-disable-next-line import/no-extraneous-dependencies
import { config } from 'dotenv';
import Path from 'path';
import { DefaultLogger } from '@grandlinex/core';
import {
  BattleNetLauncher,
  EpicLauncher,
  HtmlUtil,
  IRunGame,
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
    lg = new LocalGames(new DefaultLogger());
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
      lCmd: true,
    },
  ],
  [
    Launcher.BATTLE_NET,
    new BattleNetLauncher({}),
    {
      fallback: false,
      icon: false,
      fileExe: true,
      lCmd: false,
    },
  ],
  [
    Launcher.STEAM,
    new SteamLauncher({ apiKey: STEAM_APIKEY!, steamVanity: STEAM_VANITY! }),
    {
      fallback: true,
      icon: true,
      fileExe: false,
      lCmd: true,
    },
  ],
  [
    Launcher.UPLAY,
    new UplayLauncher({ lang: 'de-DE' }),
    {
      fallback: false,
      icon: false,
      fileExe: true,
      lCmd: true,
    },
  ],
])(`Launcher: %s`, (name, launcher, props) => {
  let games: IRunGame[];
  let game: IRunGame;
  test('register launcher', async () => {
    const r = await lg.registerLauncher(launcher);
    expect(r.success).toBeTruthy();
  });

  test('get launcher', async () => {
    const l = lg.getLauncher(name);
    expect(l).toBeDefined();
    lg.log(l?.getName());
  });
  test('get games', async () => {
    games = await launcher.getGames();
    expect(games.length).toBeGreaterThan(0);
  });
  test('get game image', async () => {
    [game] = games;
    lg.log(
      JSON.stringify(
        {
          ...game,
          runLauncher: null,
        },
        null,
        2
      )
    );
    expect(game).toBeDefined();
    const img = await game.getGameImageBase64(true);
    expect(img?.portrait).toBeDefined();
    if (img?.portrait) {
      lg.log('portrait', img.portrait.substring(0, 40));
    }
    if (props.fallback) {
      expect(img?.fallback).toBeDefined();
      lg.log('fallback', img?.fallback?.substring(0, 40));
    } else {
      expect(img?.fallback).toBeUndefined();
    }
    if (props.icon) {
      expect(img?.icon).toBeDefined();
      lg.log('icon', img?.icon?.substring(0, 40));
    } else {
      expect(img?.icon).toBeUndefined();
    }
  });
  test('get game run cmd', async () => {
    const cmd = await game.getLaunchGameCMD();
    expect(cmd).toBeDefined();
    lg.log(cmd);
  });
  test('get game shop cmd', async () => {
    const cmd = await game.getOpenShopCMD();
    if (launcher.hasShopLink()) {
      expect(cmd).toBeDefined();
      lg.log(cmd);
    } else {
      expect(cmd).toBeNull();
    }
  });
  test('get default cmd', async () => {
    const cmd = await game.defaultCMD();
    expect(cmd).toBeDefined();
  });
  test('install cmd', async () => {
    const cmd = await game.getLauncherCMD();
    if (props.lCmd) {
      expect(cmd).toBeDefined();
    } else {
      expect(cmd).toBeNull();
    }
  });
});

describe('full', () => {
  test('list games', async () => {
    const g = await lg.getGames();
    expect(g.length).toBeGreaterThan(0);
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
