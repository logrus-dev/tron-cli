import { shuffle } from 'lodash';
import { TronWeb, providers } from 'tronweb';
import config from './config';
import { delay } from './helpers';

const getTronWeb = () => {
  let fullNodeUrl: string;
  let solidityNodeUrl: string;
  let eventServerUrl: string;

  const apiKey = config.get('tronGridApiKey');
  const apiUrl = config.get('tronGridApiUrl');
  if (apiUrl) {
    fullNodeUrl = solidityNodeUrl = eventServerUrl = apiUrl;
  } else {
    let nodeHost = shuffle(config.get('nodes'))[0];
    fullNodeUrl = `http://${nodeHost}:8090`;
    solidityNodeUrl = `http://${nodeHost}:8091`;
    eventServerUrl = `http://${nodeHost}:8090`;
  }

  const timeout = config.get('timeout');
  const HttpProvider = providers.HttpProvider;
  const fullNode = new HttpProvider(fullNodeUrl, timeout);
  const solidityNode = new HttpProvider(solidityNodeUrl, timeout);
  const eventServer = new HttpProvider(eventServerUrl, timeout);
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

  if (apiKey) {
    tronWeb.setHeader({"TRON-PRO-API-KEY": apiKey});
  }

  return tronWeb;
};

const staticTronWeb = getTronWeb();

export const fromSun = staticTronWeb.fromSun;

export const toSun = staticTronWeb.toSun;

export const withTronWeb = async <T = any>(cb: (tw: TronWeb) => Promise<T>): Promise<T> => {
  const retry = config.get('retry');
  for (let i = 0; i < retry; ++i) {
    try {
      return await cb(getTronWeb());
    } catch (e: any) {
      if (config.get('debug')) {
        console.error(e);
      }
      if (i === retry - 1) {
        throw e;
      }
      await delay(config.get('retryDelay'));
    }
  }

  throw new Error('Failed to perform.');
};
