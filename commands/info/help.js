const Discord = require('discord.js');

module.exports = {
    commands: 'help',
    minArgs: 0,
    maxArgs: 0,
    callback:  message => {
    
        const { guild } = message;
        const { name } = guild;
        const icon = guild.iconURL();

        const embed = new Discord.MessageEmbed()
            .setTitle(`${name}'s available commands`)
            .setThumbnail(icon)
            .setColor('#FB5657')
            .addField('!serverinfo', 'This command is used to get info about the server')
            .addField('!userinfo || !userinfo @user', 'This command is used to get info about a user')
            .setFooter('Bot created by: Berkan Alci');

            message.channel.send(embed);
    },


}

// !add 5
// !add num1 num2