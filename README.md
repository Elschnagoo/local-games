# Local-Games

[![NPM Version](https://img.shields.io/npm/v/@elschnagoo/local-games.svg)](https://www.npmjs.com/package/@elschnagoo/local-games)
[![NPM Downloads](https://img.shields.io/npm/dt/@elschnagoo/local-games.svg)](https://www.npmjs.com/package/@elschnagoo/local-games)

> Read local game launcher config files and launch games


## Features

- Read local game launcher config files
- Get game info
- Get game image
- Get game executable
- Open Game Launcher
- Install game (partial [steam, epic])
- Open shop page (partial [steam, epic])

## Currently supported launchers
- [Steam](https://store.steampowered.com/) [win32, darwin, linux]
- [Epic Games](https://www.epicgames.com/) [win32]
- [Battle.net](https://www.blizzard.com/) [win32]
- [Ubisoft Connect](https://www.ubisoft.com/) [win32] (Uplay)

## Docs
- [API Documentation](https://elschnagoo.github.io/local-games/)

## Quickstart

### Install
Install the package via npm
```bash
npm install @elschnagoo/local-games
```

```ts
import { LocalGames, BattleNetLauncher, EpicLauncher, SteamLauncher, UplayLauncher, } from '@elschnagoo/local-games';

(async () => {
    const localGames = new LocalGames();

    // Register a launcher [Battle.net, Epic Games, Steam, Uplay] @see docs for more info
    const report = await localGames.registerLauncher(
        new BattleNetLauncher(),
        new EpicLauncher(),
        new UplayLauncher(),
        new SteamLauncher({
            apiKey: '$STEAM_WEB_API_KEY', // get on https://steamcommunity.com/dev/apikey
            steamVanity: '$STEAM_USER_VANITY', // Show on your steam profile
        })
    );

    if (report.success) {
        console.log('All Launchers registered successfully');
    } else {
        report.result.forEach(([name, success]) => {
            if (!success) {
                console.log(`${name} failed to register`);
            }
        });
    }

    const games = await localGames.getGames();

    const [game] = games;

    console.log('Game Name', game.name);
    console.log('Game is on Wishlist', game.wishList);
    console.log('Game is installed', game.installed);

    // ...

    // Returns the executable path or protocol link
    const cmd = await game.getLauncherCMD();
    console.log(cmd);
    // Returns the shop cmd if exist
    const shop = await game.getOpenShopCMD();
    console.log(shop);
    // Returns a default command to  "Start Game" > "Install" > "Open Shop"
    const def = await game.defaultCMD();
    console.log(def);

    // Returns the game image as base64 encoded string (webp)
    const images = await game.getGameImageBase64(false);
    console.log(images?.portrait);

    // ... pop child process with cmd to start the game from nodejs
    // import * as child_process from 'child_process';
    // if (def) child_process.exec(def);
})();

```
