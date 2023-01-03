#!/usr/bin/env node

import { fromSun, toSun, withTronWeb } from './tron';
import { withUsdt } from './tron-usdt';
import inquirer from 'inquirer';
import config from './config';
import { delay } from './helpers';
import logUpdate from 'log-update';

const createAccount = async () => {
  const account = await withTronWeb(tw => tw.createAccount());
  console.log(account);
};

const usdtBalance = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
    }
  ]);

  const { amount, decimals, symbol } = await withUsdt(async usdt => ({
    amount: await usdt.balanceOf(address).call(),
    decimals: await usdt.decimals().call(),
    symbol: await usdt.symbol().call(),
  }));

  console.log(symbol, (amount / (10 ** decimals)).toString());
}

const getAccount = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
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
    },
    {
      type: 'number',
      message: 'Amount',
      name: 'amount',
    },
    {
      type: 'password',
      message: 'Private key',
      name: "privateKey",
      mask: '*',
    },
  ]);

  const decimals = await withUsdt(usdt => usdt.decimals().call());
  const amountDecimal = amount * (10 ** decimals);
  let result = await withUsdt(usdt => usdt.transfer(
    addressTo,
    amountDecimal,
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
    },
    {
      type: 'number',
      message: 'Amount',
      name: 'amount',
    },
    {
      type: 'password',
      message: 'Private key',
      name: "privateKey",
      mask: '*',
    },
  ]);

  const result = await withTronWeb(tw => tw.trx.sendTransaction(addressTo, toSun(amount), privateKey));
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
      console.log(`TRX wasted: ${fromSun((result.receipt.energy_fee || 0) + (result.receipt.net_fee || 0))}`);
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
    }
  ]);

  const result = await withTronWeb(tw => tw.trx.getTransactionInfo(transactionId));
  console.log(result);
  console.log(`TRX wasted: ${fromSun(result.receipt.energy_fee || 0 + result.receipt.net_fee || 0)}`);
}

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
    console.error(e.message || e);
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
