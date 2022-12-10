import { shuffle } from 'lodash';
const TronWeb = require('tronweb');
import config from './config';
import { delay } from './helpers';

const getTronWeb = () => {
  const fullNodeIp = shuffle(config.get('nodes'))[0];

  const timeout = config.get('timeout');
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider(`http://${fullNodeIp}:8090`, timeout);
  const solidityNode = new HttpProvider(`http://${fullNodeIp}:8091`, timeout);
  const eventServer = new HttpProvider(`http://${fullNodeIp}:8090`, timeout);
  return new TronWeb(fullNode, solidityNode, eventServer);
};

const staticTronWeb = getTronWeb();

export const fromSun = staticTronWeb.fromSun;

export const toSun = staticTronWeb.toSun;

export const withTronWeb = async <T = any>(cb: (tw: any) => Promise<T>): Promise<T> => {
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
