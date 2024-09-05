Basic operations with Tron TRX and USDT tokens.
- Create a Tron account
- Send TRX transactions
- Send USDT TRC-20 transactions
- Check TRX and USDT balance

Application is 100% stateless - keys are not stored nor logged anywhere. You only enter and see them in the console.
Using official [TronWeb SDK](https://developers.tron.network/docs/tronweb-1) and [public Mainnet nodes](https://developers.tron.network/docs/networks#public-node).

```
npx @logrus/tron-cli
A known issue: "Error: Cannot find module '@noble/secp256k1'"
To solve this issue, please install @noble/secp256k1@1.7.1 manually: npm install @noble/secp256k1@1.7.1
Blame Tron devs.
```

Command arguments (all optional):

| Argument           | Type    | Default | Description |
| ------------------ | ------- | ------- | ----------- |
| `--retry`          | Number  | 10      | Number of re-tries. Each re-try uses another random node from the list. |
| `--retryDelay`     | Number  | 500     | Delay between re-tries in milliseconds. |
| `--timeout`        | Number  | 15000   | HTTP API timeout in milliseconds. |
| `--nodes`          | String  | [Public Mainnet nodes](https://developers.tron.network/docs/networks#public-node) | Comma-separated list of TRON blockchain full node IPs. |
| `--feeLimit`       | Number  | 50    | Transaction fee limit in TRX. |
| `--debug`          | Boolean | false | Show debug logs |
| `--tronGridApiUrl` | String  | Empty | [TronGrid](https://developers.tron.network/reference/background) API URL. If specified, `--nodes` argument is ignored. |
| `--tronGridApiKey` | String  | Empty | [TronGrid](https://developers.tron.network/reference/background) API Key |

