#!/usr/bin/env node

import { fromSun, toSun, withTronWeb } from './tron';
import { withUsdt } from './tron-usdt';
import inquirer from 'inquirer';
import config from './config';
import { delay, passwordTransformer } from './helpers';
import logUpdate from 'log-update';
import BigNumber from 'bignumber.js';

const createAccount = async () => {
  const account = await withTronWeb(async tw => tw.createRandom());
  console.log('❗Save this information to a safe place. It will never be displayed again.');
  console.log(account);
};

const usdtBalance = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
      filter: s => s?.trim(),
    }
  ]);

  const { amount, decimals, symbol }: { amount: bigint, decimals: bigint, symbol: string } = await withUsdt(async usdt => ({
    amount: await usdt.balanceOf(address).call(),
    decimals: await usdt.decimals().call(),
    symbol: await usdt.symbol().call(),
  }));

  console.log(symbol, (amount / BigInt(BigInt(10) ** decimals)).toString());
}

const getAccount = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
      filter: s => s?.trim(),
    }
  ]);

  const result = await withTronWeb(tw => tw.trx.getAccount(address));
  console.log(result);
}

const trxBalance = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
      filter: s => s?.trim(),
    }
  ]);

  const result = await withTronWeb(tw => tw.trx.getBalance(address));
  console.log(`TRX ${fromSun(result).toString()}`);
}

const usdtTransfer = async () => {
  const { addressTo, amount, privateKey } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account of the recipient',
      name: 'addressTo',
      filter: s => s?.trim(),
    },
    {
      type: 'number',
      message: 'Amount USD',
      name: 'amount',
    },
    {
      type: 'input',
      message: 'Private key of the sender',
      name: "privateKey",
      transformer: passwordTransformer,
    },
  ]);

  const decimals: bigint = await withUsdt(usdt => usdt.decimals().call());

  const decimalsMultiplier = new BigNumber(10).pow(new BigNumber(decimals.toString()));

  const amountBigNumber = new BigNumber(amount);
  const amountDecimal = amountBigNumber.times(decimalsMultiplier);

  let result = await withUsdt(usdt => usdt.transfer(
    addressTo,
    amountDecimal.toString(),
  ).send({
    feeLimit: toSun(config.get('feeLimit')),
  }), privateKey);

  console.log('Transaction ID: ', result);

  await waitForTransaction(result);
}

const trxTransfer = async () => {
  const { addressTo, amount, privateKey } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account of the recipient',
      name: 'addressTo',
      filter: s => s?.trim(),
    },
    {
      type: 'number',
      message: 'Amount TRX',
      name: 'amount',
    },
    {
      type: 'input',
      message: 'Private key of the sender',
      name: "privateKey",
      transformer: passwordTransformer,
    },
  ]);

  const result = await withTronWeb(tw => tw.trx.sendTransaction(addressTo, Number(toSun(Number(amount))), privateKey));
  const txID = result.transaction.txID;

  console.log('Transaction ID: ', txID);

  if (txID) {
    await waitForTransaction(txID);
  }
}

const waitForTransaction = async (transactionId: string) => {
  const iterations = 30;
  for (let i = 0; i < iterations; ++i) {
    logUpdate(`⌛ Waiting for transaction in blockchain: ${iterations - i}`);
    const result = await withTronWeb(tw => tw.trx.getTransactionInfo(transactionId));
    if (result && result.receipt) {
      console.log(result.receipt);
      showTrxWasted(result);
      return;
    }
    await delay(5000);
  }

  console.error('Could not obtain the transaction from the network');
};

const transactionInfo = async () => {
  const { transactionId } = await inquirer.prompt([
    {
      type: 'input',
      message: 'ID of transaction',
      name: 'transactionId',
      filter: s => s?.trim(),
    }
  ]);

  const result = await withTronWeb(tw => tw.trx.getTransactionInfo(transactionId));
  console.log(result);
  showTrxWasted(result);
}

const showTrxWasted = (result: any) => console.log(`TRX wasted: ${fromSun(result.receipt.energy_fee || 0 + result.receipt.net_fee || 0)}`);

const commands: { [key: string]: () => Promise<void> } = {
  'usdt-balance': usdtBalance,
  'trx-balance': trxBalance,

  'usdt-transfer': usdtTransfer,
  'trx-transfer': trxTransfer,

  'transaction-info': transactionInfo,

  'get-account': getAccount,
  'create-account': createAccount,
};

const handleErrors = (cb: (...args: any[]) => Promise<void>) => async (...args: any[]) => {
  try {
    await cb(...args);
  } catch (e: any) {
    if (config.get('debug')) {
      console.error(e);
    } else {
      console.error(e.response?.data?.Error || e.message || e);
    }
  }
};

(async () => {
  while (true) {
    const { command } = await inquirer.prompt([
      {
        type: 'list',
        message: 'Choose Tron network command',
        name: 'command',
        choices: [...Object.keys(commands), 'exit'],
        loop: false,
      }
    ]);
    if (command === 'exit') {
      return;
    }
    await handleErrors(commands[command])();
  }
})();
