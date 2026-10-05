import { get, put, BlobPreconditionFailedError } from '@vercel/blob';

export const MENU_PATH = 'menu/current.pdf';
export const storage = {
  async getMenu() {
    const result = await get(MENU_PATH, { access: 'private', useCache: false });
    return result ? { stream: result.stream, uploadedAt: result.blob.uploadedAt } : null;
  },
  async putMenu(bytes) {
    await put(MENU_PATH, bytes, { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/pdf', cacheControlMaxAge: 60 });
  },
  async read(key) {
    const result = await get(`auth/${key}.json`, { access: 'private', useCache: false });
    return result ? { value: await new Response(result.stream).json(), etag: result.blob.etag } : null;
  },
  async write(key, value, etag) {
    try {
      await put(`auth/${key}.json`, JSON.stringify(value), {
        access: 'private', addRandomSuffix: false, allowOverwrite: Boolean(etag),
        ...(etag ? { ifMatch: etag } : {}), contentType: 'application/json', cacheControlMaxAge: 60,
      });
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError || /already exists|conflicting operation against this resource/i.test(error.message)) error.conflict = true;
      throw error;
    }
  },
};
