const Discord = require('discord.js');

module.exports = {
    commands: ['cc', 'clearchannel', 'clear'],
    expectedArgs: '<number from 1-99>',
    minArgs: 1,
    maxArgs: 1,
    callback: (message, arguments) =>{
        if(message.deletable) {
            message.delete();    
        }

        let amount;
        if((parseInt(arguments[0])) > 100) {
            amount = 100;
        } else {
            amount = parseInt(arguments[0]);
        }

        message.channel.bulkDelete(amount, true).then((messages) =>{
            console.log(`Bulk Deleted ${messages.size} messages`)
        }).catch((error) => console.error);
        
    },
    permissions: ['ADMINISTRATOR']
}