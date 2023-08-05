import LocalGames from './class/LocalGames';
import BaseImg from './util/BaseImg';

import SearchUtil from './util/SearchUtil';
import HtmlUtil from './util/HtmlUtil';

export * from './class/GameLauncher';
export * from './lib';
export * from './launcher/epic/EpicLauncher';
export * from './launcher/battlenet/BattleNetLauncher';
export * from './launcher/steam/SteamLauncher';
export * from './launcher/ubisoft/UplayLauncher';

export { LocalGames, BaseImg, SearchUtil, HtmlUtil };

export default LocalGames;
