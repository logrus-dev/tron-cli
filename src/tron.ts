import lodash from 'lodash';
import { TronWeb, providers } from 'tronweb';
import config, { seedNodeIps } from './config.js';

type HttpProviderRequest = InstanceType<typeof providers.HttpProvider>['request'];
type RequestPayload = Parameters<HttpProviderRequest>[1];
type RequestMethod = Parameters<HttpProviderRequest>[2];

class RetryingHttpProvider extends providers.HttpProvider {
  constructor(host: string, timeout: number, private readonly retries: number, headers = {}) {
    super(host, timeout, '', '', headers);
  }

  override async request<T = unknown>(
    url: string,
    payload: RequestPayload = {},
    method: RequestMethod = 'get',
  ): Promise<T> {
    for (let retryAttempt = 0; ; ++retryAttempt) {
      try {
        return await super.request<T>(url, payload, method);
      } catch (error: any) {
        if (retryAttempt >= this.retries) {
          throw error;
        }

        console.error(`⚠️ ${error.message ?? 'An error occurred.'}`);
      }
    }
  }
}

const getCustomEndpointUrls = (endpoint: string): [string, string, string] => {
  const hasProtocol = /^https?:\/\//i.test(endpoint);
  const normalizedEndpoint = hasProtocol ? endpoint : `http://${endpoint}`;
  const parsedEndpoint = new URL(normalizedEndpoint);

  // A bare host is treated as a seed-style node and uses TRON's default API ports.
  if (!hasProtocol && !parsedEndpoint.pathname.slice(1) && !parsedEndpoint.port) {
    const host = parsedEndpoint.hostname;
    return [`http://${host}:8090`, `http://${host}:8091`, `http://${host}:8090`];
  }

  return [normalizedEndpoint, normalizedEndpoint, normalizedEndpoint];
};

const getTronWeb = () => {
  let fullNodeUrl: string;
  let solidityNodeUrl: string;
  let eventServerUrl: string;

  const endpoint = config.get('endpoint');
  const apiKey = config.get('tronGridApiKey');
  if (endpoint === 'grid') {
    fullNodeUrl = solidityNodeUrl = eventServerUrl = 'https://api.trongrid.io';
  } else if (endpoint === 'seed') {
    const nodeHost = lodash.shuffle(seedNodeIps)[0];
    fullNodeUrl = `http://${nodeHost}:8090`;
    solidityNodeUrl = `http://${nodeHost}:8091`;
    eventServerUrl = `http://${nodeHost}:8090`;
  } else {
    [fullNodeUrl, solidityNodeUrl, eventServerUrl] = getCustomEndpointUrls(endpoint);
  }

  const timeout = config.get('timeout');
  const retries = config.get('retry');
  const headers = apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {};
  const fullNode = new RetryingHttpProvider(fullNodeUrl, timeout, retries, headers);
  const solidityNode = new RetryingHttpProvider(solidityNodeUrl, timeout, retries, headers);
  const eventServer = new RetryingHttpProvider(eventServerUrl, timeout, retries, headers);
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

  return tronWeb;
};

const staticTronWeb = getTronWeb();

export const fromSun = staticTronWeb.fromSun;

export const toSun = staticTronWeb.toSun;

export const withTronWeb = <T = any>(cb: (tw: TronWeb) => Promise<T>): Promise<T> => cb(getTronWeb());
