// cache.js
function updateToken(tokenId, attributes, cache) {
  cache.set(tokenId.toString(), attributes);
}

function updateWallet(walletAddress, tokenId, cache) {
  const stakedTokens = cache.get(walletAddress) || new Set();
  stakedTokens.add(tokenId);
  cache.set(walletAddress, stakedTokens);
}

function removeToken(walletAddress, tokenId, cache) {
  const stakedTokens = cache.get(walletAddress);
  if (stakedTokens) {
    stakedTokens.delete(tokenId);
    cache.set(walletAddress, stakedTokens);
  }
}

function getStakedTokens(walletAddress, cache) {
  const stakedTokens = cache.get(walletAddress);
  return stakedTokens || new Set();
}

function getAttributes(tokenId, cache) {
  return cache.get(tokenId.toString()) || null;
}

module.exports = {
  updateToken,
  updateWallet,
  removeToken,
  getStakedTokens,
  getAttributes,
  // Any other caching functions you need
};
