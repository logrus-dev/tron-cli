import { Command } from 'commander';
import getTron from './tron';
import getTrc20 from './tron-trc20';
import inquirer from 'inquirer';

const program = new Command();

program.command('create-account').action(async () => {
  const tron = getTron();
  const account = await tron.createAccount();
  console.dir(account);
});

program.command('balance').argument('<string>', 'wallet').action(async (wallet) => {
  try {
    const trc20 = await getTrc20();
    const amount = await trc20.balanceOf(wallet).call();
    const decimals = await trc20.decimals().call();
    const symbol = await trc20.symbol().call();
    console.log(symbol, (amount / (10 ** decimals)).toString());
  } catch (e) {
    console.error(e);
  }
});

program.command('trx-balance').argument('<string>', 'address').action(async (address) => {
  try {
    const tron = await getTron();

    const result = await tron.trx.getBalance(address);
    console.log(`TRX ${(result / 1000000).toString()}`);
  } catch (e) {
    console.error(e);
  }
});

program.command('transfer')
  .argument('<string>', 'walletTo')
  .argument('<number>', 'amount')
  .action(async (walletTo, amount) => {
    try {
      const { privateKey } = await inquirer.prompt([
        {
          type: 'password',
          message: 'Private key',
          name: "privateKey",
        }
      ]);
      const trc20 = await getTrc20(privateKey);
      const decimals = await trc20.decimals().call();
      const amountDecimal = amount * (10 ** decimals);
      let result = await trc20.transfer(
        walletTo,
        amountDecimal,
      ).send({
        feeLimit: 1000000,
      });
      console.log('result: ', result);
    } catch (e) {
      console.error(e);
    }
  });

  program.command('transaction-info')
  .argument('<string>', 'transactionId')
  .action(async (transactionId) => {
    try {
      const tron = await getTron();
      let result = await tron.trx.getTransactionInfo(transactionId);
      console.log('result: ', result);
    } catch (e) {
      console.error(e);
    }
  });

program.configureOutput({
  // Visibly override write routines as example!
  writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
  writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
  // Highlight errors in color.
  outputError: (str, write) => write(str)
});

program.parse();


