function checkIgnore(entries, result, callback) {
  // if (result && result.contextInfo && !result.contextInfo.compiler && !entries.has(result.request)) {
  //   console.log(`Ignoring ${result.request}`);
  //   return callback();
  // }
  return callback(null, result);
}

function createEntrySet(entry) {
  const entrySet = new Set();
  let entries = entry;
  if (typeof (entries) === 'string') {
    entrySet.add(entries);
    return entrySet;
  }
  if (typeof (entries) === 'object') {
    entries = Object.keys(entries).reduce((entriesArray, entryName) => entriesArray.concat(entries[entryName]), []);
  }
  if (entries instanceof Array) {
    entries.forEach(entryFile => entrySet.add(entryFile));
    return entrySet;
  }
  throw new Error('The DLLIgnorePlugin could not parse the webpack.entry property');
}

export default {
  apply(compiler) {
    const entries = createEntrySet(compiler.options.entry);
    compiler.plugin('normal-module-factory', (nmf) => {
      nmf.plugin('before-resolve', (result, callback) => checkIgnore(entries, result, callback));
    });
    compiler.plugin('context-module-factory', (cmf) => {
      cmf.plugin('before-resolve', (result, callback) => checkIgnore(entries, result, callback));
    });
  }
};
