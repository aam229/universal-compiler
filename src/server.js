import path from 'path';
import config from 'application-runtime-config';
import { hooks, execute } from './hooks';
import FileWatcher from './config/WebpackAssetWatcher';

new FileWatcher(
    path.resolve(config.server.staticPath),
    config.dll ? path.join(config.server.path, 'client-dll-assets.json') : null,
    path.join(config.server.path, 'client-assets.json')
  )
  .load()
  .then(assets => execute(hooks.SERVER_CREATE, { applicationConfig: config, assets }))
  .then(({ server }) => execute(hooks.SERVER_START, { config: config.server, server }))
  .catch(err => console.error('Error booting the server: ', err.stack));
