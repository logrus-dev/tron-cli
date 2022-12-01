import { Command } from 'commander';
import getTron from './tron';
import getTrc20 from './tron-trc20';

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

program.command('transfer').argument('<string>', 'wallet').action(async (wallet) => {
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

program.configureOutput({
  // Visibly override write routines as example!
  writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
  writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
  // Highlight errors in color.
  outputError: (str, write) => write(str)
});

program.parse();


