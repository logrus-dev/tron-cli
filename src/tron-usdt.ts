import getTron from './tron';

const usdtSmartContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

export default async (privateKey?: string) => {
  try {
    const tron = await getTron();
    tron.setAddress(usdtSmartContract);
    if (privateKey) {
      tron.setPrivateKey(privateKey);
    }
    return await tron.contract().at(usdtSmartContract);
  } catch(error) {
      console.error("trigger smart contract error",error)
  }
};
