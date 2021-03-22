const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { connection } = require('mongoose');

const queue = new Map();
// queue(message.guild.id, queue_constructor object {voice channel, text channel, connection, song[]})

module.exports = {
    commands: ['play'],
    expectedArgs: '<link or song (only when using play)>',
    minArgs: 1,
    callback: async (message, arguments, text, client) => {
    
        const { member, channel } = message;
        const voice = member.voice.channel;
        
        if(!voice){
            const embed = new Discord.MessageEmbed()
                .setTitle(`${client.user.username}`)
                .setDescription(`Please join a Voice Channel first!`)
                .setColor('#9C0000')
                .setFooter('created by: Berkan Alci');
            return channel.send(embed);
        }

        const serverQueue = queue.get(message.guild.id);

        
        let song = {};
        
        console.log('checkpoint two');

        if (ytdl.validateURL(arguments[0])) {
            const songInfo = await ytdl.getInfo(arguments[0]);
            song = { 
                title: songInfo.videoDetails.title, 
                url: songInfo.videoDetails.video_url
            }
        } else {
            const finder = async (query) => {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            };

            const video =  await finder(arguments.join(' '));
            if(video) {
                song = {
                    title: video.title,
                    url: video.url
                };
            } else {
                const embed2 = new Discord.MessageEmbed()
                    .setTitle(`${client.user.username}`)
                    .setDescription(`There was a problem finding your video!`)
                    .setColor('#9C0000')
                    .setFooter('created by: Berkan Alci');
                channel.send(embed2);
            }
        }
        
        if(!serverQueue){
            
            const queueConstructor = {
                voice_channel: voice,
                text_channel: channel,
                connection: null,
                songs: []
            }

            queue.set(message.guild.id, queueConstructor);
            queueConstructor.songs.push(song);

            try {
                const connection = await voice.join();
                queueConstructor.connection = connection;
                videoPlayer(message.guild, queueConstructor.songs[0], client);
            } catch (err) {
                queue.delete(message.guild.id);
                const embed3 = new Discord.MessageEmbed()
                    .setTitle(`${client.user.username}`)
                    .setDescription(`There was an error connecting!`)
                    .setColor('#9C0000')
                    .setFooter('created by: Berkan Alci');
                channel.send(embed3);
                throw err;
            }

        } else {
            serverQueue.songs.push(song);
            const embed3 = new Discord.MessageEmbed()
                    .setTitle(`${client.user.username}`)
                    .setDescription(`${song.title} has been added to the queue!`)
                    .setColor('#0BD514')
                    .setFooter('created by: Berkan Alci');
            return channel.send(embed3);
        }

    }

};


const videoPlayer = async (guild, song, client) =>{
    const songQueue = queue.get(guild.id);

    if(!song){
        songQueue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    
    const stream = ytdl(song.url, {filter: 'audioonly'});
    songQueue.connection.play(stream, { seek: 0, volume: 0.5}).on('finish', () =>{
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    });

    const embed4 = new Discord.MessageEmbed()
                    .setTitle(`${client.user.username}`)
                    .setDescription(`Now playing:  ${song.title}`)
                    .setColor('#FB5657')
                    .setFooter('created by: Berkan Alci');

    await songQueue.text_channel.send(embed4);
}

