//Workaround for https://github.com/evanw/esbuild/issues/3319
const glob = 'manifest.json';
import('../public/' + glob);

export { };

