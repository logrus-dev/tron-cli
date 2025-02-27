import { withTronWeb } from "./tron";
import { Contract } from 'tronweb';

const usdtSmartContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

export const withUsdt = <T = any>(cb: (usdt: Contract) => Promise<T>, privateKey?: string): Promise<T> => withTronWeb(async tw => {
  tw.setAddress(usdtSmartContract);
  if (privateKey) {
    tw.setPrivateKey(privateKey);
  }
  const contract = await tw.contract().at(usdtSmartContract);
  return await cb(contract);
});
