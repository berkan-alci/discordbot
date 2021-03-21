const Discord = require('discord.js');

module.exports = {
    commands: 'serverinfo',
    minArgs: 0,
    maxArgs: 0,
    callback:  message => {
    
        const { guild } = message;
        const { region, name, memberCount, ownerID, afkTimeout, afkChannelID, premiumTier, premiumSubscriptionCount } = guild;
        const icon = guild.iconURL();

        const embed = new Discord.MessageEmbed()
            .setTitle(`${name}'s server info`)
            .setThumbnail(icon)
            .setColor('#FB5657')
            .addFields(
            {
                name: 'Region:',
                value: region,
            }, 
            {
                name: 'Server Owner',
                value: `<@${ownerID}>`
            }, 
            {
                name: 'Total Members:',
                value: memberCount
            }, 
            {
                name: 'AfkTimeout & Channel',
                value: `Timeout: ${afkTimeout/60} seconds\nChannel: <#${afkChannelID}>`
            }, {
                name: 'Nitro:',
                value: `Tier: ${premiumTier}\nBoosted: ${premiumSubscriptionCount} times`
            })
            .setFooter('Bot created by: Berkan Alci');

            message.channel.send(embed);
    },


}

// !add 5
// !add num1 num2