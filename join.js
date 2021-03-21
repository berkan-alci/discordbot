const Discord = require('discord.js');
const welcomeSchema = require('./schemas/welcome-schema');
const mongo = require('./mongo');
const command = require('./command');

module.exports = (client) =>{
    const cache = {} // guilId : [channelId, text]

    command(client, 'setwelcome', async message =>{
        console.log('Registering command simjoin');

        const { member, channel, content, guild } = message;

        if (!member.hasPermission('ADMINISTRATOR')){
            const embed = new Discord.MessageEmbed()
            .setTitle(`${client.user.username}`)
            .setDescription(`You don't have the permissions to execute this command.`)
            .setColor('#9C0000')
            .setFooter('created by: Berkan Alci');

            channel.send(embed);
            return;
        }

        let text = content;
        const split = text.split(' ');

        if (split.length < 2) { 
            const embed2 = new Discord.MessageEmbed()
            .setTitle(`${client.user.username}`)
            .setDescription(`Please provide a welcome message!`)
            .setColor('#9C0000')
            .setFooter('created by: Berkan Alci');

            channel.send(embed2);
            return;
        } 

        split.shift();
        text = split.join(' ');

        cache[guild.id] = [channel.id, text];

        await mongo().then(async (mongoose)=>{
            try {
                await welcomeSchema.findOneAndUpdate({
                    _id: guild.id
                },{
                    _id: guild.id,
                    channelId: channel.id,
                    text,
                },{
                    upsert: true,
                })
            } finally {
                mongoose.connection.close();
            }
        });

        
    });

    const onJoin = async (member) =>{
        const { guild } = member;
        let data = cache[guild.id];

        if(!data) {
            console.log('FETCHING FROM DATABASE');
            
            await mongo().then(async (mongoose)=>{
                try {
                    const result = await welcomeSchema.findOne({_id: guild.id})
                    cache[guild.id] = data = [result.channelId, result.text];
                } finally{
                    mongoose.connection.close();
                }
            });
        }

        const channelId = data[0];
        const text = data[1];
        const channel = guild.channels.cache.get(channelId);

        const embedFinal = new Discord.MessageEmbed()
            .setTitle(`${client.user.username}`)
            .setDescription(`${text}`)
            .setColor('#FB5657')
            .setFooter('created by: Berkan Alci');

        channel.send(embedFinal);
        console.log('EXECUTED ONE');
    };

    command(client, 'simjoin', (message) =>{
        console.log('Registering command simjoin');
        onJoin(message.member);
    });

    client.on('guildMemberAdd', (member)=>{

        onJoin(member);
    });

};