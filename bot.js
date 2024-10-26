const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const db = new sqlite3.Database('users.db');

const token = 'bot_token';
const bot = new TelegramBot(token, { polling: true });

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE
  )`);
});

bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  db.run('INSERT OR IGNORE INTO users (user_id) VALUES (?)', [userId], function(err) {
    if (err) {
      return console.log(err.message);
    }
    bot.sendMessage(userId, 'Вы подписались на рассылку!');
  });
});

function sendMessageToAllUsers(message) {
  db.all('SELECT user_id FROM users', [], (err, rows) => {
    if (err) {
      return console.log(err.message);
    }
    rows.forEach((row) => {
      bot.sendMessage(row.user_id, message);
    });
    console.log('Сообщение отправлено всем пользователям!');
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function askForMessage() {
  rl.question('Введите сообщение для рассылки: ', (message) => {
    sendMessageToAllUsers(message);
    askForMessage(); 
  });
}

console.log('Бот запущен!');
askForMessage();




