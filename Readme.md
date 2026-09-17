Basic operations with Tron TRX and USDT tokens.
- Create a Tron account
- Send TRX transactions
- Send USDT TRC-20 transactions
- Check TRX and USDT balance

Application is 100% stateless - private keys are not stored nor logged anywhere. You only enter them in the console.
Using official [TronWeb SDK](https://developers.tron.network/docs/tronweb-1) and [public Mainnet nodes](https://developers.tron.network/docs/networks#public-node).

> **Breaking changes in version 2.0.0 and later:** The [TRON network documentation](https://developers.tron.network/docs/networks) states: "To help keep the public seed nodes' P2P service stable, avoid using their HTTP or gRPC APIs as chain-data query endpoints; use your own Fullnode or a published API endpoint from an RPC provider instead." The author of `tron-cli` considers querying public nodes a significant denial-of-service risk, so the default CLI behavior now uses the TronGrid API without requiring an API key. Use `--endpoint seed` to restore the previous public-seed-node behavior as a fallback.
>
> Grid mode works without an API key by default, however the rate limits are ridiculous, so effectively you **have to** use a TronGrid API key now. Obtain a free one at [TronGrid](https://www.trongrid.io/) and provide it with `--tronGridApiKey` or `TRON_CLI_TRON_GRID_API_KEY`. The bundled seed-node list may become outdated; use `--endpoint <node>` to specify a missing public node explicitly, including its IP or hostname and optional port.

```
npx @logrus/tron-cli
```

Command arguments (all optional):

| Argument           | Environment Variable             | Type    | Default | Description |
| ------------------ | -------------------------------- | ------- | ------- | ----------- |
| `--retry`          | `TRON_CLI_RETRY`                 | Number  | 3       | Number of retries after the initial request. Retry attempts are logged and run immediately. |
| `--timeout`        | `TRON_CLI_TIMEOUT`               | Number  | 10000   | HTTP API timeout in milliseconds. |
| `--endpoint`       | `TRON_CLI_ENDPOINT`              | String  | `grid`  | Endpoint: `grid` uses TronGrid, `seed` uses the hardcoded seed nodes, or provide a custom URL, hostname, IP, and optional port. `http://` is added when omitted. |
| `--feeLimit`       | `TRON_CLI_FEE_LIMIT`              | Number  | 50      | Transaction fee limit in TRX. |
| `--debug`          | `TRON_CLI_DEBUG`                 | Boolean | false   | Show resolved endpoint URLs and full errors. |
| `--tronGridApiKey` | `TRON_CLI_TRON_GRID_API_KEY`     | String  | Empty   | Optional API key for Grid or a compatible custom endpoint. Get a free key from [TronGrid](https://www.trongrid.io/). |

`.env` file is supported too.
