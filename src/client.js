import applicationConfig from 'application-runtime-config';
import {
  execute,
  hooks
} from './hooks';

execute(hooks.RENDER, Promise.resolve({ ssr: applicationConfig.ssr, context: {} }))
  .catch(err => console.error('Failed to render client: ', err.stack));
