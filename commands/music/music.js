const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { connection } = require('mongoose');

const queue = new Map();
// queue(message.guild.id, queue_constructor object {voice channel, text channel, connection, song[]})

module.exports = {
    commands: ['music', 'm'],
    expectedArgs: '<play/skip/stop> <link or song (only when using play)>',
    minArgs: 1,
    callback: async (message, arguments, text, client) => {
    
        const { member, channel, guild } = message;
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
        

        const args = arguments.slice(1);
        const argCheck = arguments[0];

        if(argCheck === 'play') {
            if (ytdl.validateURL(args)) {
                const songInfo = await ytdl.getInfo(args);
                song = { 
                    title: songInfo.videoDetails.title, 
                    url: songInfo.videoDetails.video_url
                }
            } else {
                const finder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                };
    
                const video =  await finder(args.join(' '));
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
                    videoPlayer(message.guild, queueConstructor.songs[0]);
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

                
                
                let titles = serverQueue.songs.map(t => t.title).join('\n')

                const embed3 = new Discord.MessageEmbed()
                .setTitle(`Playing on: ${guild.name}`)
                .addField('Has been added: ', song.title)
                .addField(`Current Queue: `,`${titles}`,true)
                .setColor('#0BD514')
                .setFooter('created by: Berkan Alci');


            return channel.send(embed3);
        
            }

        } else if (argCheck === 'skip') { 
            skipSong(guild, message, serverQueue);
        } else if (argCheck === 'stop') {
            stopSong(message, serverQueue);
        }

    }

};


const videoPlayer = async (guild, song) =>{
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
                    .setTitle(`Playing on: ${guild.name}`)
                    .setDescription(`Now playing:  ${song.title}`)
                    .setColor('#FB5657')
                    .setFooter('created by: Berkan Alci');

    await songQueue.text_channel.send(embed4);
}

const skipSong = async (guild, message, serverQueue) => {
    if (!message.member.voice.channel) {
        const embed = new Discord.MessageEmbed()
                .setTitle(`Playing on: ${guild.name}`)
                .setDescription(`You need to be in a channel to skip a song!`)
                .setColor('#9C0000')
                .setFooter('created by: Berkan Alci');
            return message.channel.send(embed);
        
    }
    if(!serverQueue){
        const embed2 = new Discord.MessageEmbed()
                .setTitle(`Playing on: ${guild.name}`)  
                .setDescription(`There are no songs in queue 😔`)
                .setColor('#9C0000')
                .setFooter('created by: Berkan Alci');

        return message.channel.send(embed2);
    }

    let titles = serverQueue.songs.map(t => t.title).slice(1).join('\n')
    const embed3 = new Discord.MessageEmbed()
                    .setTitle(`Playing on: ${guild.name}`)  
                    .setDescription(`Skipped to next song!`)
                    .addField(`Current Queue: `,`${titles}`,true)
                    .setColor('#0BD514')
                    .setFooter('created by: Berkan Alci');
                await serverQueue.text_channel.send(embed3);
    serverQueue.connection.dispatcher.end();
}

const stopSong = async (message, serverQueue) => {
    
    const { guild }= message;
    const embed = new Discord.MessageEmbed()
        .setTitle(`Playing on: ${guild.name}`)
        .setDescription(`Music bot has been stopped!`)
        .setColor('#9C0000')
        .setFooter('created by: Berkan Alci');

    message.channel.send(embed);
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}
