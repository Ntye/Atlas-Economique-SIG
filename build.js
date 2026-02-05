const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/App.js'],
  bundle: true,
  outfile: 'public/js/app.bundle.js',
  format: 'iife',
  globalName: 'App',
  sourcemap: true,
  minify: !isWatch,
  target: ['es2020'],
  loader: {
    '.css': 'empty'  // CSS is loaded separately
  }
};

if (isWatch) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('Build complete!');
  });
}
