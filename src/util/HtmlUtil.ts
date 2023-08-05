import fs from 'fs';
import LocalGames from '../class/LocalGames';

export default class HtmlUtil {
  static async make(games: LocalGames, path: string) {
    const steam = fs.createWriteStream(path);
    steam.write(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>BASE-IMG</title></head><body>`
    );
    for (const l of games.listLaunchers()) {
      console.log(`Launcher: ${l}`);
      steam.write(
        `<h2>Launcher: ${l}</h2><br/><div style="display: flex;flex-wrap: wrap;gap: 8px">`
      );
      const launcher = games.getLauncher(l)!;
      const gamesList = await launcher.getGames();
      for (const game of gamesList) {
        console.log(`Game: ${game.name}`);
        const img = await launcher.getGameImageBase64(game, true);
        const img2 = img.portrait || img.fallback;
        steam.write(
          `<div style="outline: 1px solid black;"><h4>${
            game.name
          }</h4><p><b>installed:</b> ${
            game.installed ? '<span style="color: green">true</span>' : 'false'
          } <b>wishlist:</b> ${
            game.wishList ? '<span style="color: green">true</span>' : 'false'
          }</p><img alt="${game.name}" width="228px" ${
            img.portrait ? 'height="336px"' : ''
          } src="data:image/webp;base64,${img2}" /></div>`
        );
      }
      steam.write(`</div>`);
    }
    steam.write(`</body></html>`);
    steam.end();
    steam.close();
  }
}
