import path from 'path';
import config from 'application-runtime-config';
import { hooks, execute } from './hooks';
import FileWatcher from './config/WebpackAssetWatcher';

new FileWatcher(
    config.dll ? path.join(config.assetConfigPath, 'client-dll-assets.json') : null,
    path.join(config.assetConfigPath, 'client-assets.json')
  )
  .load()
  .then(assets => execute(hooks.SERVER_CREATE, { assets }))
  .then(({ server }) => execute(hooks.SERVER_START, { server }))
  .catch(err => console.error('Error booting the server: ', err.stack));
