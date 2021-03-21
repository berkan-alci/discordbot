const Discord = require('discord.js');
const client = new Discord.Client();
const loadCommands = require('./commands/load-commands')
const join = require('./join');

require('dotenv').config();
const token = process.env.TOKEN;

client.on('ready', async () =>{
    console.log(`Logged in as ${client.user.tag}!`);

    loadCommands(client);   
    join(client);
    
});


client.login(token);