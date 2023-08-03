# Local-Games

> Read local game launcher config files and launch games


## Features

- Read local game launcher config files
- Get game info
- Get game image
- Get game executable


## Currently supported launchers
- [Steam](https://store.steampowered.com/) [win32, darwin, linux]
- [Epic Games](https://www.epicgames.com/) [win32]
- [Battle.net](https://www.blizzard.com/) [win32]

## Docs
- [API Documentation](https://elschnagoo.github.io/local-games/)

## Quickstart

### Install
Install the package via npm
```bash
npm install @elschnagoo/local-games
```

```ts
import { LocalGames, BattleNetLauncher } from '@elschnagoo/local-games';
 
const localGames = new LocalGames();

// Register a launcher [Battle.net, Epic Games, Steam] @see docs for more info
localGames.registerLauncher(new BattleNetLauncher())

const games = await localGames.getGames();

const [game] = games;

// Returns the executable path
const cmd = await localGames.getLaunchGameCMD(game);

// Returns the game image as base64 encoded string
const images = await localGames.getGameImageBase64(game);

console.log(images.portrait)

```
