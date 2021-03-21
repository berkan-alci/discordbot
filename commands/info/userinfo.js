const Discord = require('discord.js');

module.exports = {
    commands: 'userinfo',
    expectedArgs: '<@mentionUser>',
    minArgs: 0,
    maxArgs: 1,
    callback: message => {
         
        const { guild, channel } = message;

        const user = message.mentions.users.first() || message.member.user;
        const member = guild.members.cache.get(user.id);
        let userbot = user.bot ? 'Bot' : 'Human';
        const roles = member.roles.cache.sort((a, b )=> b.position - a.position).map(r => r.toString()).slice(0, -1).join(' | '); 

        const embed = new Discord.MessageEmbed()
            .setTitle(`User info about: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor('#FB5657')
            .addFields({
                name: 'User Tag:',
                value: `<@${user.id}>`
            }, {
                name: 'Nickname:',
                value: member.nickname || 'None'
            }, {
                name: 'This user is a:',
                value: userbot
            }, {
                name: 'Joined server:',
                value: new Date(member.joinedTimestamp).toLocaleDateString(),
            }, {
                name: 'Joined Discord:',
                value: new Date(user.createdTimestamp).toLocaleDateString()
            }, {
                name: 'Roles:',
                value: roles
            },)
            .setFooter('Bot created by: Berkan Alci');

            channel.send(embed);
    },

}

// !add 5
// !add num1 num2