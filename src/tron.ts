import { shuffle } from 'lodash';
const TronWeb = require('tronweb');

const fullNodeIps = shuffle([
  '3.225.171.164',
  '52.53.189.99',
  '18.196.99.16',
  '34.253.187.192',
  '18.133.82.227',
  '35.180.51.163',
  '54.252.224.209',
  '18.228.15.36',
  '52.15.93.92',
  '34.220.77.106',
  '15.207.144.3',
  '13.124.62.58',
  '15.222.19.181',
  '18.209.42.127',
  '3.218.137.187',
  '34.237.210.82',
  '47.241.20.47',
  '161.117.85.97',
  '161.117.224.116',
  '161.117.83.38',
]);

const fullNodeIp = fullNodeIps[0];

export default () => {
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider(`http://${fullNodeIp}:8090`);
  const solidityNode = new HttpProvider(`http://${fullNodeIp}:8091`);
  const eventServer = new HttpProvider(`http://${fullNodeIp}:8090`);
  return new TronWeb(fullNode, solidityNode, eventServer);
}
