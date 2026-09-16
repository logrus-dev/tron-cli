import lodash from 'lodash';
import { TronWeb, providers } from 'tronweb';
import config from './config.js';

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

const getTronWeb = () => {
  let fullNodeUrl: string;
  let solidityNodeUrl: string;
  let eventServerUrl: string;

  const apiKey = config.get('tronGridApiKey');
  const apiUrl = config.get('tronGridApiUrl');
  if (apiUrl) {
    fullNodeUrl = solidityNodeUrl = eventServerUrl = apiUrl;
  } else {
    let nodeHost = lodash.shuffle(config.get('nodes'))[0];
    fullNodeUrl = `http://${nodeHost}:8090`;
    solidityNodeUrl = `http://${nodeHost}:8091`;
    eventServerUrl = `http://${nodeHost}:8090`;
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
