// Discord js config
const Discord = require('discord.js');

// Env config
require('dotenv').config()


//client config
const prefix = "!"
const client = new Discord.Client();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message',async (msg) => {
var args = msg.content.substring(prefix.length).split(" ");
var bot = msg.mentions.users.find(user=> user.id === client.user.id)|| null
if(bot != null && !msg.guild.roles.cache.find(role=>role.name === 'blacklist')) {
    if(msg.guild.ownerID != msg.author.id || !msg.member.permissions.has('ADMINISTRATOR')) return msg.reply(`You Don't have permission to use this command!`)

    await msg.guild.roles.create({
        data: {
          name: 'blacklist',
          color: 'BLUE',
        },
        reason: 'BlackList role',
      })
        .then(async (role)=>{
            var channels = msg.guild.channels.cache
            channels .forEach(channel=>{
                if(process.env.unblacklistedchannels.length >= 1 && !process.env.unblacklistedchannels.split(',').includes(channel.id)) {
                    channel.updateOverwrite(role, { VIEW_CHANNEL: false });
                }               
            })
             msg.reply(`Role created and permissions overwrited!`)
             msg.member.roles.add(role)
        })
}
switch(args[0]){
    case'blacklist':
    if(msg.guild.ownerID != msg.author.id || !msg.member.permissions.has('ADMINISTRATOR')) return msg.reply(`You Don't have permission to use this command!`)
    var person = msg.mentions.members.first() 
    var role = msg.guild.roles.cache.find(role=>role.name === 'blacklist')
    if(!role) return msg.reply("Bot not started yet,please mention the bot first! use:``@bot``")
    if(!person) return msg.reply("You didn't mention the user! use:``!blacklist <mention> <timer (optional)> <reason>``")
    if(person.roles.cache.find(r => r.name === "blacklist")) return msg.reply(`User already blacklisted!`)
    var timer = (isNaN(args[2]) === false) ? args[2] : 'forever';
    var reason = msg.content.slice(args[0].length + args[1].length + args[2].length + 3)|| reason=== null
    if(!reason) return msg.reply("You didn't specify the reason! use:``!blacklist <mention> <timer (optional)> <reason>``")
    person.roles.add(role).then(()=>{
        msg.channel.send(`${person.user.username} blacklisted by ${msg.author}! reason:**${reason}**,for: **${timer} minutes**`)
        if(timer != 'forever') {
            setTimeout(function(){ 
                person.roles.remove(role)
            },timer * 60 * 1000 );
        }
    })
    break;
    case 'unblacklist':
       if(msg.guild.ownerID != msg.author.id || !msg.member.permissions.has('ADMINISTRATOR')) return msg.reply(`You Don't have permission to use this command!`)
       var person = msg.mentions.members.first() 
       var role = msg.guild.roles.cache.find(role=>role.name === 'blacklist')
       if(!role) return msg.reply("Bot not started yet,please mention the bot first! use:``@bot``")
       if(!person) return msg.reply("You didn't mention the user! use:``!unblacklist <mention>``")
       if(!person.roles.cache.find(r => r.name === "blacklist")) return msg.reply(`User isn't in the blacklist!`)
       person.roles.remove(role)
       msg.channel.send(`User ${person.user.username} unblacklisted by ${msg.author}`)
    break;
}
})
client.on("channelCreate", (channel) => {
   var role = channel.guild.roles.cache.find(role=>role.name === 'blacklist')
    if(!role) return  
    channel.updateOverwrite(role, { VIEW_CHANNEL: false });
    
})
client.login(process.env.token);