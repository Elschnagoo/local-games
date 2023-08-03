import sharp from 'sharp';
import fs from 'fs';
import { selectClient } from '../class/NodeCon';

export default class BaseImg {
  private static async resizeBuffer(buffer: Buffer) {
    return sharp(buffer).resize(228, 336).webp().toBuffer();
  }

  private static async convertBuffer(buffer: Buffer) {
    return sharp(buffer).webp().toBuffer();
  }

  static async posterResizeImageFile(path: string) {
    const file = await fs.promises.readFile(path);

    if (!file) {
      return null;
    }
    const nBuff = await this.resizeBuffer(file);

    return nBuff.toString('base64');
  }

  static async BufferFromUrl(url: string): Promise<Buffer | null> {
    return new Promise((resolve) => {
      selectClient(url)
        .get(
          url,
          {
            timeout: 10000,
          },
          (res) => {
            const data: Uint8Array[] = [];

            if (res.statusCode !== 200) {
              resolve(null);
              return;
            }

            res.on('data', (chunk) => {
              data.push(chunk);
            });
            res.on('end', () => {
              resolve(Buffer.concat(data));
            });
          }
        )
        .on('error', (err) => {
          console.log(`Error: ${err.message}`);
          resolve(null);
        });
    });
  }

  static async fromUrl(url: string, resize = true): Promise<string | null> {
    const buff = await this.BufferFromUrl(url);
    if (!buff) {
      return null;
    }
    const nBuff = resize
      ? await this.resizeBuffer(buff)
      : await this.convertBuffer(buff);

    return nBuff.toString('base64');
  }
}
