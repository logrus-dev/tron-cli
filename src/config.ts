import convict from 'convict';
import { isString } from 'lodash';
import { existsSync } from 'fs';

const fullNodeIps = [
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
];

convict.addFormat({
  name: 'comma-separated-strings',
  validate: () => { },
  coerce: val => {
    if (Array.isArray(val)) {
      return val;
    }
    if (!isString(val)) {
      return [];
    }
    return val.split(',');
  }
});

const config = convict({
  retry: {
    doc: 'Number of re-tries. Each re-try uses another random node from the list.',
    format: Number,
    default: 10,
    env: 'TRON_CLI_RETRY',
    arg: 'retry',
  },
  retryDelay: {
    doc: 'Delay between re-tries in milliseconds.',
    format: Number,
    default: 500,
    env: 'TRON_CLI_RETRY_DELAY',
    arg: 'retry-delay',
  },
  timeout: {
    doc: 'HTTP API timeout in milliseconds.',
    format: Number,
    default: 15000,
    env: 'TRON_CLI_TIMEOUT',
    arg: 'timeout',
  },
  nodes: {
    doc: 'List of TRON blockchain full node IPs.',
    format: 'comma-separated-strings',
    env: 'TRON_CLI_NODES',
    arg: 'nodes',
    default: fullNodeIps,
  },
  feeLimit: {
    doc: 'Transaction fee limit in TRX.',
    format: Number,
    env: 'TRON_CLI_FEE_LIMIT',
    arg: 'fee-limit',
    default: 50,
  },
  debug: {
    doc: 'Show debug logs.',
    format: Boolean,
    env: 'TRON_CLI_DEBUG',
    arg: 'debug',
    default: false,
  },
  tronGridApiUrl: {
    doc: 'TronGrid API URL.',
    format: String,
    env: 'TRON_CLI_TRON_GRID_API_URL',
    arg: 'tronGridApiUrl',
    default: null,
    nullable: true,
  },
  tronGridApiKey: {
    doc: 'TronGrid API key.',
    format: String,
    env: 'TRON_CLI_TRON_GRID_API_KEY',
    arg: 'tronGridApiKey',
    default: null,
    nullable: true,
  },
});

if (existsSync('./config.json')) {
  config.loadFile('./config.json');
}

config.validate({ allowed: 'strict' });

export default config;
