const { prefix } = require ('../config.json');
const Discord = require('discord.js');

const validatePermissions = (permissions) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
    ];

    for(const permission of permissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Unknown permission node "${permissions}"`)
        }
    } 
};

module.exports = (client,  commandOptions) => {
    let {
        commands,
        expectedArgs = '',
        permissionError = 'You do not have permission to run this command',
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        requiredRoles = [],
        callback
     } = commandOptions

     //ensure command & aliases are in an array

     if (typeof commands === 'string') {
         commands = [commands];
     }

     console.log(`Registering command "${commands[0]}"`);

     //ensure perms are in array and are all valid
     if(permissions.length){
         if(typeof permissions === 'string') {
             permissions = [permissions];
         }
         validatePermissions(permissions);
     }

     //Listen for messages

     client.on('message', message => {
         const {member, content, guild} = message;

         for (const alias of commands) {
            if (content.toLowerCase().startsWith(`${prefix}${alias.toLowerCase()}`)) {
                
                //required perms 
                for (const permission of permissions ) {
                    if(!member.hasPermission(permission)) {
                        const p = new Discord.MessageEmbed()
                            .setTitle(`${client.user.username}`)
                            .setDescription(`${permissionError}`)
                            .setColor('#9C0000')
                            .setFooter('created by: Berkan Alci');
                        message.reply(p);
                        return;
                    }
                }
                //Res roles
                for (const requiredRole of requiredRoles) {
                    const role = guild.roles.cache.find(r => r.name === requiredRole);

                    if(!role || !member.roles.cache.has(role.id)) {
                        
                        const r = new Discord.MessageEmbed()
                            .setTitle(`${client.user.username}`)
                            .setDescription(`You must have the "${requiredRole}" role to use this command.`)
                            .setColor('#9C0000')
                            .setFooter('created by: Berkan Alci');
                        message.reply(r);
                        return;
                    }
                }

                // split on any number of spaces
                // ex: !add 5 10 --> ['!add', '5' ,'10']
                const arguments = content.split(/[ ]+/);

                //remove the command = 1st index
                arguments.shift();

                //check syntax !
                if(arguments.length < minArgs ||(maxArgs !== null &&  arguments.length > maxArgs)) {
                    
                    const s = new Discord.MessageEmbed()
                        .setTitle(`${client.user.username}`)
                        .setDescription(`Incorrect syntax! use ${prefix}${alias} ${expectedArgs}`)
                        .setColor('#9C0000')
                        .setFooter('created by: Berkan Alci');
                    message.reply(s);
                    return;
                }

                console.log(`Command ${alias} returns ${arguments} in an array`);

                //handle Custom command code
                callback(message, arguments, arguments.join(' '), client)
                return
            }
         }
     });
};