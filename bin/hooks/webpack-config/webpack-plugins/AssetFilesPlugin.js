import fs from 'fs';
import chalk from 'chalk';

export default class AssetFilesPlugin {
  constructor(outputPath, publicPath) {
    this.outputPath = outputPath;
    this.publicPath = publicPath;
  }

  apply(compiler) {
    compiler.plugin('compile', this.onCompile.bind(this));
    compiler.plugin('emit', this.onEmit.bind(this));
  }

  onCompile() {
    if (fs.existsSync(this.outputPath)) {
      console.log(chalk.green.bold(`Deleting asset file ${this.outputPath}`));
      fs.unlinkSync(this.outputPath);
    }
  }

  onEmit(compiler, callback) {
    const stats = compiler.getStats().toJson();
    const assets = Object.keys(stats.assetsByChunkName)
      .map(key => stats.assetsByChunkName[key])
      .reduce((reducedAssets, namedAssets) => reducedAssets.concat(namedAssets), []);

    const baseOutput = {
      javascript: [],
      styles: [],
      others: [],
      publicPath: this.publicPath
    };
    const output = assets.reduce((out, file) => {
      if (file.endsWith('.js')) {
        out.javascript.push(file);
      } else if (file.endsWith('.css')) {
        out.styles.push(file);
      } else {
        out.others.push(file);
      }
      return out;
    }, baseOutput);

    console.log(chalk.green.bold(`Writing asset file to ${this.outputPath}`));
    fs.writeFileSync(this.outputPath, JSON.stringify(output, null, 2));
    callback();
  }
}

