const Discord = require('discord.js');
const client = new Discord.Client();
const path = require('path');
const fs = require('fs');
const join = require('./join');
require('dotenv').config();
const token = process.env.TOKEN;

client.on('ready', async () =>{
    console.log(`${client.user.tag} is ready!`);

    const baseFile = 'command-base.js';
    const commandBase = require(`./commands/${baseFile}`);
  
    const readCommands = (dir) => {
      const files = fs.readdirSync(path.join(__dirname, dir))
      for (const file of files) {
        const stat = fs.lstatSync(path.join(__dirname, dir, file))
        if (stat.isDirectory()) {
          readCommands(path.join(dir, file))
        } else if (file !== baseFile) {
          const option = require(path.join(__dirname, dir, file))
          commandBase(client, option)
        }
      }
    };
  
    readCommands('commands')
    join(client);

});

client.login(token);