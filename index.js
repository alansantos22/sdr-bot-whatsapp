const wppconnect = require('@wppconnect-team/wppconnect');
const chalk = require('chalk');
const config = require('./botConfig');

// Track chats where the human has intervened
const ignoredChats = new Set();
// Track chats where the bot is currently sending a message to prevent self-interruption
const sendingResponseTo = new Set();

// Start the session
wppconnect
  .create({
    session: 'whatsapp-bot-session',
    headless: true, // Headless mode as requested
    logQR: true, // Logs QR code to terminal so user can scan it
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'], // Useful for some environments
    autoClose: 0, // Keep the bot running
  })
  .then((client) => start(client))
  .catch((error) => console.log(chalk.red('Error starting client:'), error));

function start(client) {
  console.log(chalk.green.bold('Bot is running and listening for messages...'));

  // Listen for ANY message to detect if I (the host) sent a message
  client.onAnyMessage((message) => {
    // If "I" sent the message (fromMe is true)
    if (message.fromMe) {
      const chatId = message.to;

      // Check if the bot is currently sending a message to this chat
      // If so, we assume this "fromMe" message is the bot's own message (or a collision we accept)
      if (sendingResponseTo.has(chatId)) {
        return;
      }

      // If we are NOT sending a response, this is a Human Intervention
      if (!ignoredChats.has(chatId)) {
        ignoredChats.add(chatId);
        console.log(chalk.yellow(`\n⚠ Human intervention detected. Bot paused for chat: ${chatId}`));
      }
    }
  });

  client.onMessage(async (message) => {
    // Ignore groups
    if (message.isGroupMsg) return;

    // Ignore chats where human intervened
    if (ignoredChats.has(message.from)) return;

    const messageBody = message.body;
    let responseText = null;

    // 1. Check Exact Matches (Case Insensitive)
    const exactMatchKey = Object.keys(config.exactMatches).find(
      key => key.toLowerCase() === messageBody.toLowerCase()
    );

    if (exactMatchKey) {
      responseText = config.exactMatches[exactMatchKey];
    } else {
      // 2. Check Keywords (Case Insensitive)
      // We look for the first keyword found in the message
      const keywordKey = Object.keys(config.keywords).find(
        key => messageBody.toLowerCase().includes(key.toLowerCase())
      );

      if (keywordKey) {
        responseText = config.keywords[keywordKey];
      }
    }

    // If a response was found, send it
    if (responseText) {
      // Mark this chat as "Bot is sending"
      sendingResponseTo.add(message.from);

      try {
        await client.sendText(message.from, responseText);

        // Colorful console log
        console.log(
          chalk.cyan('--------------------------------------------------\n') +
          chalk.green('✔ Message received and replied!\n') +
          chalk.yellow(`From: ${message.from}\n`) +
          chalk.magenta(`Content: ${messageBody}\n`) +
          chalk.blue(`Response: ${responseText}\n`) +
          chalk.cyan('--------------------------------------------------')
        );
      } catch (error) {
        console.error(chalk.red('Error sending message:'), error);
      } finally {
        // We add a small delay before releasing the lock, just in case the event arrives slightly later
        // or multiple events fire (e.g. status update). 1-2 seconds should be safe enough.
        setTimeout(() => {
            sendingResponseTo.delete(message.from);
        }, 2000);
      }
    }
  });
}
