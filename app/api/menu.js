import { createHandlers } from '../server/handlers.mjs';
import { storage } from '../server/storage.mjs';

export default { fetch: (request) => createHandlers(storage, process.env).menu(request) };
