const wppconnect = require('@wppconnect-team/wppconnect');
const chalk = require('chalk');

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

  client.onMessage(async (message) => {
    // Logic: Not a group message AND exact text match
    if (message.isGroupMsg === false && message.body === 'Olá, vim pelo site e quero saber mais') {
      try {
        await client.sendText(
          message.from,
          'Olá! Vi que você veio pelo nosso site. Seja bem-vindo! Eu sou o assistente virtual, em que posso ajudar?'
        );

        // Colorful console log
        console.log(
          chalk.cyan('--------------------------------------------------\n') +
          chalk.green('✔ Message received and replied!\n') +
          chalk.yellow(`From: ${message.from}\n`) +
          chalk.magenta(`Content: ${message.body}\n`) +
          chalk.cyan('--------------------------------------------------')
        );
      } catch (error) {
        console.error(chalk.red('Error sending message:'), error);
      }
    }
  });
}
