import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const modulePathRegex = /.*!/;
const modulePackageRegex = new RegExp(`\\${path.sep}node_modules\\${path.sep}`);

export default class AssetFilesPlugin {
  constructor(outputPath, ignoredModules) {
    this.outputPath = outputPath;
    this.ignoredModules = ignoredModules;
  }

  apply(compiler) {
    compiler.plugin('emit', this.onEmit.bind(this));
  }

  onEmit(compiler, callback) {
    const stats = compiler.getStats().toJson();
    const ignoreModules = new Set(this.ignoredModules);
    const moduleFiles = stats.modules
      .map(module => AssetFilesPlugin.getModulePath(module.identifier))
      .filter(module => !module.startsWith('ignored') && !module.startsWith('multi'))
      .filter((module) => {
        const packageName = AssetFilesPlugin.getModulePackage(module);
        return !ignoreModules.has(packageName) && packageName !== 'universal-redux' && packageName !== null;
      })
      .reduce((s, module) => s.add(module), new Set());

    console.log(chalk.green.bold(`Writing DLL entry files to ${this.outputPath}`));
    fs.writeFileSync(this.outputPath, JSON.stringify(Array.from(moduleFiles), null, 2), 'utf8');
    callback();
  }

  static getModulePath(identifier) {
    return identifier.replace(modulePathRegex, '');
  }

  static getModulePackage(modulePath) {
    const packages = modulePath.split(modulePackageRegex);
    if (packages.length > 1) {
      const lastSegment = packages.pop();
      if (lastSegment[0] === ('@')) {
        // package is a scoped package
        const offset = lastSegment.indexOf(path.sep) + 1;
        packages.push(lastSegment.slice(0, offset + lastSegment.slice(offset).indexOf(path.sep)));
      } else {
        packages.push(lastSegment.slice(0, lastSegment.indexOf(path.sep)));
      }
    }
    packages.shift();
    return packages.length > 0 ? packages.shift() : null;
  }
}
