const TronWeb = require('tronweb');

export default () => {
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider("http://3.225.171.164:8090");
  const solidityNode = new HttpProvider("http://3.225.171.164:8090");
  const eventServer = new HttpProvider("http://3.225.171.164:8090");
  return new TronWeb(fullNode, solidityNode, eventServer);
};
