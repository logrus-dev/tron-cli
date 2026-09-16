import convict from 'convict';
import { existsSync } from 'fs';

export const seedNodeIps = [
  '3.225.171.164',
  '52.53.189.99',
  '18.196.99.16',
  '34.253.187.192',
  '18.133.82.227',
  '35.180.51.163',
  '54.252.224.209',
  '18.231.27.82',
  '52.15.93.92',
  '34.220.77.106',
  '13.127.47.211',
  '13.124.62.58',
  '13.229.128.108',
  '35.182.37.246',
  '34.218.41.201',
  '15.207.144.3',
  '13.124.142.115',
  '15.207.147.245',
  '13.231.82.66',
];

const config = convict({
  retry: {
    doc: 'Number of retries after the initial request.',
    format: Number,
    default: 3,
    env: 'TRON_CLI_RETRY',
    arg: 'retry',
  },
  timeout: {
    doc: 'HTTP API timeout in milliseconds.',
    format: Number,
    default: 10000,
    env: 'TRON_CLI_TIMEOUT',
    arg: 'timeout',
  },
  endpoint: {
    doc: "TRON endpoint: 'grid' for TronGrid, 'seed' for hardcoded seed nodes, or an arbitrary endpoint for specific node.",
    format: String,
    env: 'TRON_CLI_ENDPOINT',
    arg: 'endpoint',
    default: 'grid',
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
