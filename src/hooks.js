import chalk from 'chalk';

// Define the available hooks
export const hooks = {
  COMPILER_CONFIG: 'compiler_config',
  WEBPACK_CONFIG_DLL_ANALYZE: 'dll_analyze',
  WEBPACK_CONFIG_DLL_BUILD: 'dll_build',
  WEBPACK_CONFIG_APPLICATION_BUILD: 'application_build',
  WEBPACK_CONFIG_APPLICATION_BUILD_SERVER: 'application_build_server',
  WEBPACK_CONFIG: [ 'dll_analyze', 'dll_build', 'application_build', 'application_build_server' ],

  RENDER: 'render_client',

  SERVER_CREATE: 'create_server',
  SERVER_START: 'start_server',
};

export const environments = {
  SERVER: 'server',
  CLIENT: 'client',
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
};

export const positions = {
  BEFORE: 'before_',
  AFTER: 'after_'
};


// Cache for the custom hook executors
const executors = new Map();

const environmentValues = Array.concat(
  Object.keys(environments).map(key => environments[key])
);
const positionValues = Array.concat(
  Object.keys(positions).map(key => positions[key])
);

// Register a hook by adding it to the executors map
// The bulk of this function is argument validation to help the developer
// find issues with the code.
export function register(hook, executor, { environments: hookEnvs, position: hookPos, priority } = {}) {
  const hookNames = hook instanceof Array ? hook : [ hook ];
  const hookPriority = priority || 0;
  let hookPosition = hookPos;
  let hookEnvironments = hookEnvs || [];

  if (hookNames.some(hookName => !hookName)) {
    console.log(chalk.yellow('One of the hooks is null or empty', new Error().stack));
  }
  if (typeof (hookPriority) !== 'number') {
    console.log(chalk.yellow('The hook\'s priority must be a number'));
    return;
  }
  if (typeof (executor) !== 'function') {
    console.log(chalk.yellow('The hook executor must be a function'));
    return;
  }
  if (hookPosition && positionValues.indexOf(hookPos) === -1) {
    console.log(chalk.yellow(`Unknown hook position '${hookPosition}'`));
    return;
  } else if (!hookPosition) {
    hookPosition = '';
  }
  if (hookEnvironments && !(hookEnvironments instanceof Array)) {
    hookEnvironments = [ hookEnvironments ];
  }
  if (hookEnvironments.indexOf(environments.CLIENT) === -1 && hookEnvironments.indexOf(environments.SERVER) === -1) {
    hookEnvironments.push(environments.CLIENT, environments.SERVER);
  }
  if (hookEnvironments.indexOf(environments.PRODUCTION) === -1 && hookEnvironments.indexOf(environments.DEVELOPMENT) === -1) {
    hookEnvironments.push(environments.PRODUCTION, environments.DEVELOPMENT);
  }
  for (let i = 0; i < hookEnvironments.length; i++) {
    if (environmentValues.indexOf(hookEnvironments[i]) !== -1) {
      continue;
    }
    console.log(chalk.yellow(`Unknown hook environment '${hookEnvironments[i]}'`));
    return;
  }
  // Do not register the hook if it does not match the environment
  if (hookEnvironments.indexOf(process.env.JS_ENV) === -1 || hookEnvironments.indexOf(process.env.NODE_ENV) === -1) {
    return;
  }

  hookNames.forEach((hookName) => {
    const fullHook = hookPosition + hookName;
    let existingExecutor = executors.get(fullHook);
    if (hookPosition === '' && !!existingExecutor) {
      console.log(chalk.yellow(`The implementation of the '${hookName}' hook has already been registered`));
      return;
    }
    const executorEntry = {
      executor,
      priority: hookPriority
    };
    // There can be multiple BEFORE and AFTER executors
    if (hookPosition) {
      if (!existingExecutor) {
        existingExecutor = [];
        executors.set(fullHook, existingExecutor);
      }
      existingExecutor.push(executorEntry);
      existingExecutor.sort((e1, e2) => e2.priority - e1.priority);
    } else {
      executors.set(fullHook, executor);
    }
  });
}

// Execute registered hook or the default executor. It always returns a promise
export function execute(hook, properties, defaultExecutor) {
  const beforeExecutors = executors.get(positions.BEFORE + hook);
  const executor = executors.get(hook) || defaultExecutor;
  const afterExecutors = executors.get(positions.AFTER + hook);

  let props = properties;
  if (!executor) {
    throw new Error(`You must register a plugin that defines the implementation of the '${hook}' hook.`);
  }
  // Modify the input props via the before hooks (if any).
  if (beforeExecutors) {
    props = beforeExecutors.reduce((inProps, entry) => {
      const outProps = entry.executor(inProps);
      return outProps === undefined ? inProps : outProps;
    }, props);
  }
  let result = executor(props);
  // Modify the output result via the after hooks (if any).
  if (afterExecutors) {
    result = afterExecutors.reduce((inResult, entry) => {
      const outResult = entry.executor(inResult, props);
      return outResult === undefined ? inResult : outResult;
    }, result);
  }

  return result;
}
