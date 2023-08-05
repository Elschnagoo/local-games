import fs from 'fs';
import Path from 'path';

export default class SearchUtil {
  static async searchFileInFolder(
    folder: string,
    file: string
  ): Promise<string | null> {
    if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
      return null;
    }
    const dir = await fs.promises.readdir(folder, { withFileTypes: true });
    for (const cur of dir) {
      if (cur.isDirectory()) {
        const c = await SearchUtil.searchFileInFolder(
          Path.join(folder, cur.name),
          file
        );
        if (c) {
          return c;
        }
      }
      if (cur.isFile()) {
        if (cur.name === file) {
          return Path.join(folder, cur.name);
        }
      }
    }
    return null;
  }
}
