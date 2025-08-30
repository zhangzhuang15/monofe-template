import open from 'open';
import { glob } from 'glob';
import { join } from "node:path";
import { cwd } from "node:process";
import { existsSync } from "node:fs";
import { set as color } from "ansi-color";
import { promises as dns } from "node:dns";

async function findTop10PagesPath() {
  const currentDir = cwd();
  if (!existsSync(join(currentDir, 'pages'))) {
    return [];
  }

  return await glob(join(currentDir, 'pages', '**/*.html'), { absolute: false, cwd: cwd() }).
    then(paths => {
      const slicedPaths = paths.slice(0, 10);
      slicedPaths.sort();
      return slicedPaths;
    }, () => []);
}


/**
 * 
 * @param {import("vite").ViteDevServer} server 
 */
async function getUrlPrefixs(server) {
  const address = server.httpServer.address();
  const {port} = address;
  const protocol = server.config.server.https ? 'https' : 'http';
  const {base} = server.config;
  let host = server.config.server.host ?? 'localhost';
  if (typeof host === 'boolean') host = 'localhost';
  
  try {
    await dns.lookup(host);
  } catch (e) {
    console.log(color(`Host ${host} is not found`, 'ref'));
    console.log(`instead, we use ${color('localhost', 'green')}`);
    host = 'localhost';
  }
  
  const urlPrefix = `${protocol}://${host}:${port}${base}`;
  return {
    urlPrefix,
    protocol,
    host,
    port,
    base
  };
}

/**
 * 
 * @param {import("vite").ViteDevServer} server 
 */
async function getTouristUrls(server) {
  // eslint-disable-next-line prefer-const
  let { urlPrefix, protocol, port, host } = await getUrlPrefixs(server);
  if (urlPrefix.endsWith('/')) urlPrefix = urlPrefix.slice(0, -1);
  const paths = await findTop10PagesPath();
  const urls = paths.map(it => `${urlPrefix}/${it}`);
  let local = [];
  let network = [];

  if (['127.0.0.1', '0.0.0.0', 'localhost'].includes(host)) {
    local = urls;
  } else {
    network = urls;
  }

  return {
    local, network, protocol, port, host
  };
}

/**
 * 
 * @param {string} url 
 */
async function openPageInBrowser(url) {
  try {
    // use default browser to open url
    await open(url);
  } finally {}
}

/**
 * 
 * @param {string} host 
 * @returns 
 */
function isLocal(host) {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(host);
}

let serverIsRestarted = false;

export default () => ({
  name: 'custom-dev-server-open',
  /**
   * @param {import("vite").ViteDevServer} server
  */
  configureServer(server) {
    const prevOpen = server.config.server.open;
    server.config.server.open = false;
    return () => {
      const {restart} = server;
      server.restart = async () => {
        serverIsRestarted = true;
        return await restart();
      };
        
      const oldPrintUrls = server.printUrls;
      server.printUrls = async () => {
        const { host, protocol, port, local, network } = await getTouristUrls(server);
        const localUrl = `${protocol}://localhost:${port}/_pages`;
        const networkUrl = isLocal(host) ? '' : `${protocol}://${host}:${port}/_pages`;
        if (server.resolvedUrls) {
          server.resolvedUrls.local = [localUrl];
          server.resolvedUrls.network = networkUrl === '' ? [] : [networkUrl];
        }
        oldPrintUrls();

        if (serverIsRestarted) return;

        if (!prevOpen) return;

        // override --open action
        if (prevOpen === true) {
          openPageInBrowser(networkUrl !== '' ? networkUrl : localUrl);
          return; 
        } 
        
        if (typeof prevOpen === 'string') {
          const url = local.find(path => path.includes(prevOpen)) || network.find(path => path.includes(prevOpen));
          if (!url) {
            console.log(color(`${prevOpen} is not in the above list`, 'red'));
            const _url = networkUrl !== '' ? networkUrl : localUrl;
            console.log(color(`instead, open ${_url}`, 'green'));
            openPageInBrowser(_url);
            return;
          } 
          openPageInBrowser(url);
        }
      };
    };
  }

});