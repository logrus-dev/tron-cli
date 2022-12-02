import getTron from './tron';

const trc20SmartContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

export default async (privateKey?: string) => {
  try {
    const tron = await getTron();
    tron.setAddress(trc20SmartContract);
    if (privateKey) {
      tron.setPrivateKey(privateKey);
    }
    return await tron.contract().at(trc20SmartContract);
  } catch(error) {
      console.error("trigger smart contract error",error)
  }
};
