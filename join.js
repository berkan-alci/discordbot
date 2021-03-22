const Discord = require('discord.js');
const welcomeSchema = require('./schemas/welcome-schema');
const mongo = require('./mongo');


module.exports  = async (client) =>{

    const onJoin = async (member) => {
        
        const cache = {}
        const { guild, channel, content } = member;
        let data = cache[guild.id];


        

        if(!data){
            console.log('FETCHING FROM DB');

            await mongo().then(async (mongoose)=>{
                try {
                    const result = await welcomeSchema.findOne({_id: guild.id});
      
                    cache[guild.id] = data = [result.channelId, result.text];   

                } finally {
                    mongoose.connection.close();

                }
            });
        }

        const channelId = data[0];
        const text = data[1];
        const ch = guild.channels.cache.get(channelId);
        const id = member.user.id;

        
        const textUp = text.replace(/<@>/g, `<@${id}>`);

        const embedFinal = new Discord.MessageEmbed()
        .setTitle(`${client.user.username}`)  //${client.user.username}
        .setDescription(`${textUp}`) //${text}
        .setThumbnail(member.user.displayAvatarURL())
        .setColor('#FB5657')
        .setFooter('created by: Berkan Alci');

        ch.send(embedFinal);

    }

    client.on('guildMemberAdd', (member) =>{
        onJoin(member);
    });
    
}
