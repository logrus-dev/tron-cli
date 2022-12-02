import { Command } from 'commander';
import getTron from './tron';
import getTrc20 from './tron-trc20';
import inquirer from 'inquirer';

const createAccount = async () => {
  const tron = getTron();
  const account = await tron.createAccount();
  console.dir(account);
};

const usdtBalance = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
    }
  ]);

  const trc20 = await getTrc20();
  const amount = await trc20.balanceOf(address).call();
  const decimals = await trc20.decimals().call();
  const symbol = await trc20.symbol().call();
  console.log(symbol, (amount / (10 ** decimals)).toString());
}

const accountResources = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
    }
  ]);

  const tron = await getTron();

  const result = await tron.trx.getAccountResources(address);
  console.log(result);
}

const getAccount = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
    }
  ]);

  const tron = await getTron();

  const result = await tron.trx.getAccount(address);
  console.log(result);
}

const freezeBalance = async () => {
  const { address, amount, resource, privateKey } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
    },
    {
      type: 'number',
      message: 'Amount',
      name: 'amount',
    },
    {
      type: 'list',
      message: 'Resource',
      name: 'resource',
      choices: ['BANDWIDTH', 'ENERGY'],
    },
    {
      type: 'password',
      message: 'Private key',
      name: "privateKey",
      mask: '*',
    },
  ]);

  const tronWeb = await getTron();

  const tradeObj = await tronWeb.transactionBuilder.freezeBalance(
    tronWeb.toSun(amount),
    3,
    resource,
    tronWeb.address.toHex(address),
    tronWeb.address.toHex(address),
  );

  const signedTxn = await tronWeb.trx.sign(tradeObj, privateKey);
  const receipt = await tronWeb.trx.sendRawTransaction(signedTxn);

  console.log(receipt);
}

const trxBalance = async () => {
  const { address } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Tron account address',
      name: 'address',
    }
  ]);

  const tron = await getTron();

  const result = await tron.trx.getBalance(address);
  console.log(`TRX ${(result / 1000000).toString()}`);
}

const usdtTransfer = async () => {
  const { addressTo, amount, privateKey, feeLimit } = await inquirer.prompt([
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
    {
      type: 'number',
      message: 'Private key',
      name: "feeLimit",
      default: 50,
    }
  ]);

  const tronWeb = await getTron();
  const trc20 = await getTrc20(privateKey);
  const decimals = await trc20.decimals().call();
  const amountDecimal = amount * (10 ** decimals);
  let result = await trc20.transfer(
    addressTo,
    amountDecimal,
  ).send({
    feeLimit: tronWeb.toSun(feeLimit),
  });

  console.log('Transaction ID: ', result);

  await waitForTransaction(result);
}

const waitForTransaction = async (transactionId: string) => {
  const tron = await getTron();

  for (let i = 0; i < 30; ++i) {
    const result = await tron.trx.getTransactionInfo(transactionId);
    if (result && result.receipt) {
      console.log(result.receipt);
      console.log(`TRX wasted: ${tron.fromSun(result.energy_fee + result.net_fee)}`);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
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

  const tron = await getTron();
  const result = await tron.trx.getTransactionInfo(transactionId);
  console.log(result);
  console.log(`TRX wasted: ${tron.fromSun(result.receipt.energy_fee + result.receipt.net_fee)}`);
}

const commands: { [key: string]: () => Promise<void> } = {
  'create-account': createAccount,
  'usdt-balance': usdtBalance,
  'trx-balance': trxBalance,
  'usdt-transfer': usdtTransfer,
  'transaction-info': transactionInfo,
  'get-account-resources': accountResources,
  'get-account': getAccount,
  'freeze-balance': freezeBalance,
};

const handleErrors = (cb: (...args: any[]) => Promise<void>) => async (...args: any[]) => {
  try {
    await cb(...args);
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  const { command } = await inquirer.prompt([
    {
      type: 'list',
      message: 'Choose Tron network command',
      name: 'command',
      choices: Object.keys(commands)
    }
  ]);
  await handleErrors(commands[command])();
})();
