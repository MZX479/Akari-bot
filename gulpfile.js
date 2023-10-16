const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('./tsconfig.json');
const gulp_clean = require('gulp-clean');
const path = require('path');
const through = require('through2');

/**
 * @description Customised version of from https://www.npmjs.com/package/gulp-typescript-path-resolver
 */
function replacePath(code, filePath, rootPath, targetPaths) {
  const tscpaths = Object.keys(targetPaths);
  const lines = code.split('\n');
  return lines
    .map((line) => {
      let matches = [];
      let require_matches = line.match(/require\(('|")(.*)('|")\)/g);
      Array.prototype.push.apply(matches, require_matches);
      if (!matches) return line;
      // Walk through every require
      for (let match of matches) {
        // Find each paths
        for (let tscpath of tscpaths) {
          // Find required module & check if its path matching what is described in the paths config.
          let required_modules = match.match(new RegExp(tscpath, 'g'));
          if (required_modules && required_modules.length > 0) {
            for (let required_module of required_modules) {
              // Get relative path and replace
              let sourcePath = path.dirname(filePath),
                targetPath;
              // module/* --- file/*
              if (tscpath[tscpath.length - 1] === '*') {
                targetPath = path.resolve(
                  rootPath +
                    '/' +
                    targetPaths[tscpath].map((_p) => _p.match('/*', ''))
                );

                line = line.replace(
                  new RegExp(tscpath.replace(/\*+/g, ''), 'g'),
                  './' +
                    path
                      .relative(sourcePath, targetPath)
                      .replace(/\\+/gi, '/') +
                    '/'
                );
              }
              // module -- file
              else {
                targetPath = path.resolve(
                  rootPath + '/' + targetPaths[tscpath]
                );
                line = line.replace(
                  new RegExp(tscpath, 'g'),
                  './' +
                    path.relative(sourcePath, targetPath).replace(/\\+/gi, '/')
                );
              }
            }
          }
        }
      }
      return line;
    })
    .join('\n');
}
/**
 * @description Customised version from lib https://www.npmjs.com/package/gulp-typescript-path-resolver
 */
function tsPathResolver(importOptions, overwriteOptions) {
  overwriteOptions = overwriteOptions || {};
  importOptions.paths = importOptions.paths || {};
  overwriteOptions.paths = overwriteOptions.paths || {};
  Object.assign(importOptions.paths, overwriteOptions.paths);
  return through.obj(function (file, enc, cb) {
    let code = file.contents.toString('utf8');
    code = replacePath(
      code,
      file.history.toString(),
      importOptions.outDir,
      importOptions.paths
    );
    file.contents = new Buffer.from(code);
    this.push(file);
    cb();
  });
}

function Clean() {
  return gulp.src('dist', { read: false, allowEmpty: true }).pipe(gulp_clean());
}

function Build() {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(tsPathResolver(tsProject.config.compilerOptions))
    .pipe(gulp.dest(tsProject.config.compilerOptions.outDir));
}

exports.default = gulp.series(Clean, Build);
