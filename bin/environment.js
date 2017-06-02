import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

function configureJSEnvironment(serverOrClient) {
  if (!serverOrClient) {
    const isServer = process.argv.indexOf('server') !== -1;
    const isClient = process.argv.indexOf('client') !== -1;
    if (!isServer && !isClient) {
      throw new Error('The command arguments should include a target (server or client)');
    } else if (isServer && isClient) {
      throw new Error('The command arguments should include only one target (server or client)');
    } else if (isServer) {
      process.env.JS_ENV = 'server';
    } else if (isClient) {
      process.env.JS_ENV = 'client';
    }
  } else {
    process.env.JS_ENV = serverOrClient;
  }
}

function configureNodeEnvironment(developmentOrProduction, ucConfig) {
  if (!developmentOrProduction) {
    const isDevelopment = process.argv.indexOf('development') !== -1;
    const isProduction = process.argv.indexOf('production') !== -1;
    if (!isDevelopment && !isProduction) {
      if (!ucConfig.environment) {
        if (!process.env.NODE_ENV) {
          throw new Error('One of the command arguments, .ucrc environment or process.env.NODE_ENV should be set to development or production');
        } else if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
          throw new Error('The process.env.NODE_ENV value is invalid (development or production) ');
        }
      } else {
        if (ucConfig.environment !== 'development' && ucConfig.environment !== 'production') {
          throw new Error('The .ucrc environment value is invalid (development or production) ');
        }
        process.env.NODE_ENV = ucConfig.environment;
      }
    } else if (isDevelopment && isProduction) {
      throw new Error('The command arguments should include only one environment (development or production)');
    } else if (isDevelopment) {
      process.env.NODE_ENV = 'development';
    } else if (isProduction) {
      process.env.NODE_ENV = 'production';
    }
  } else {
    process.env.NODE_ENV = developmentOrProduction;
  }
}

function isModulePathValid(modulePath) {
  try {
    require.resolve(modulePath);
    return true;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') console.log(chalk.red(e.stack));
    return false;
  }
}

function getHookPaths(pluginPath, hookPaths) {
  if (!hookPaths) {
    return [];
  }
  const arrayHookPaths = hookPaths instanceof Array ? hookPaths : [ hookPaths ];
  return arrayHookPaths.map(hookPath => path.resolve(pluginPath, hookPath));
}

function areHookPathValid(pluginName, hookPaths) {
  const isInvalid = hookPaths.some((hookPath) => {
    if (!isModulePathValid(hookPath)) {
      console.log(chalk.red(`The plugin ${pluginName}'s configuration is invalid: The hook file ${hookPath} does not exist`));
      return true;
    }
    return false;
  });
  return !isInvalid;
}

const CONFIG_FILE = 'universal-compiler.config';
function getPluginConfigPath(pluginName) {
  const possiblePaths = [
    `${pluginName}/${CONFIG_FILE}`,
    `universal-compiler-plugin-${pluginName}/${CONFIG_FILE}`,
    path.resolve(process.cwd(), pluginName, CONFIG_FILE)
  ];

  const pluginPath = possiblePaths.find(pp => isModulePathValid(pp));
  if (!pluginPath) {
    console.log(chalk.red(`The plugin ${pluginName} could not be found`));
    possiblePaths.forEach((possiblePath) => {
      console.log(chalk.red(`    require('${possiblePath}') failed`));
    });
    return null;
  }
  return require.resolve(pluginPath);
}

function getPluginConfig(pluginName, pluginConfigPath) {
  const config = require(pluginConfigPath);
  const pluginPath = path.dirname(pluginConfigPath);
  if (!config.hooks) {
    console.log(chalk.red(`The plugin ${pluginName}'s configuration is invalid: No hooks file defined`));
    return null;
  }
  if (!config.name) {
    console.log(chalk.red(`The plugin ${pluginName}'s configuration is invalid: No name defined`));
    return null;
  }
  if (config.dependencies && !(config.dependencies instanceof Array)) {
    console.log(chalk.red(`The plugin ${pluginName}'s configuration is invalid: Dependencies should be undefined or an array`));
    return null;
  }
  const pluginConfig = {
    name: config.name,
    path: pluginPath,
    hooks: {},
    dependencies: config.dependencies || [],
  };
  if (typeof config.hooks === 'object') {
    pluginConfig.hooks.client = getHookPaths(pluginPath, config.hooks.client);
    pluginConfig.hooks.server = getHookPaths(pluginPath, config.hooks.server);
    pluginConfig.hooks.compile = getHookPaths(pluginPath, config.hooks.compile);

    if (!areHookPathValid(pluginName, pluginConfig.hooks.client) ||
      !areHookPathValid(pluginName, pluginConfig.hooks.server) ||
      !areHookPathValid(pluginName, pluginConfig.hooks.compile)) {
      return null;
    }
  } else {
    console.log(chalk.red(`The plugin ${pluginName}'s configuration is invalid: The hooks property should be a string or object`));
    return null;
  }
  if (!pluginConfig.hooks.server && !pluginConfig.hooks.client && !pluginConfig.hooks.compile) {
    console.log(chalk.red(`The plugin ${pluginName}'s configuration is invalid: At least one hook file should be present`));
  }

  return pluginConfig;
}

function checkPluginDependencies(name, plugins) {
  const plugin = plugins.get(name);
  if (!plugin || !plugin.isValid) {
    return false;
  }
  if (plugin.isProcessed) {
    return plugin.isValid;
  }
  if (plugin.isProcessing) {
    console.log(`There is a circular dependency on plugin ${name}`);
    return false;
  }
  plugin.isProcessing = true;
  const isValid = plugin.config.dependencies.every((dependency) => {
    if (!plugins.has(dependency)) {
      console.log(`The dependency ${dependency} for plugin ${name} is missing`);
      return false;
    }
    if (!checkPluginDependencies(dependency, plugins)) {
      console.log(`The dependency ${dependency} for plugin ${name} is invalid`);
      return false;
    }
    return true;
  });
  plugin.isValid = isValid;
  plugin.isProcessed = true;
  plugin.isProcessing = false;
  return isValid;
}

function configurePlugins(plugins) {
  if (!plugins) {
    throw new Error('The .ucrc must include a plugins property');
  }
  if (!(plugins instanceof Array)) {
    throw new Error('The .ucrc plugins property should be an array');
  }
  if (plugins.some(plugin => typeof (plugin) !== 'string')) {
    throw new Error('The .ucrc plugins array values should be strings');
  }
  const pluginsConfig = plugins
    .map((pluginName) => {
      const pluginPath = getPluginConfigPath(pluginName);
      if (!pluginPath) {
        return null;
      }
      return getPluginConfig(pluginName, pluginPath);
    })
    .filter(pluginConfig => pluginConfig !== null);

  const isProcessed = false;
  const isValid = true;
  const pluginsMap = pluginsConfig.reduce((s, config) => s.set(config.name, { config, isProcessed, isValid }), new Map());
  return pluginsConfig.filter(pluginConfig => checkPluginDependencies(pluginConfig.name, pluginsMap));
}

export function requireCompilerHooks(plugins) {
  require('./hooks/config');
  plugins.forEach((pluginConfig) => {
    pluginConfig.hooks.compile.forEach(hookPath => require(hookPath));
  });
}

export function configureEnvironment(serverOrClient, developmentOrProduction) {
  const ucConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ucrc')));

  configureJSEnvironment(serverOrClient);
  configureNodeEnvironment(developmentOrProduction, ucConfig);
  ucConfig.plugins = configurePlugins(ucConfig.plugins);
  requireCompilerHooks(ucConfig.plugins);
  return ucConfig;
}

