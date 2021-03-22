const Discord = require('discord.js');
const mongoose = require('mongoose');
const mongo = require('../../mongo');
const welcomeSchema = require('../../schemas/welcome-schema');


module.exports = {
    commands: 'setwelcome',
    minargs: 1,
    expectedArgs: '<Enter your text here>',
    callback: async (message, client, arguments) => {
        const cache = {} // GuildId:[channelId, text]
        const {member, channel, content, guild} = message;
        let text = content;
        
        // getting rid of the !command
        const split = text.split(' ');
        split.shift();
        text = split.join(' ');
        
        cache[guild.id] = [channel.id, text]
        // Store in cache => Don't need to open a connection everytime
        

        // Save & update DB
        console.log('SAVING/UPDATING TO DB');
        await mongo().then(async (mongoose) =>{
            try {
                await welcomeSchema.findOneAndUpdate({
                    _id: guild.id
                },{
                    _id: guild.id,
                    channelId: channel.id,
                    text
                },{
                    upsert: true
                })
            } finally {
                mongoose.connection.close();
            }
        });

    
    },
    permissions: ['ADMINISTRATOR'],
};
