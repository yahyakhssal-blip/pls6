const {Client,GatewayIntentBits,REST,Routes,Collection,Partials,EmbedBuilder}=require("discord.js");
const fs=require("fs"),path=require("path"),config=require("./config.json");
if(!config.token.includes("PUT_YOUR")&&!config.clientId.includes("PUT_YOUR")){
 const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildModeration],partials:[Partials.Channel]});
 client.commands=new Collection();
 for(const f of fs.readdirSync("./commands").filter(x=>x.endsWith(".js"))){const c=require("./commands/"+f);client.commands.set(c.data.name,c);}
 const data=n=>{const p="./data/"+n;if(!fs.existsSync(p))fs.writeFileSync(p,"{}");return JSON.parse(fs.readFileSync(p));};
 const save=(n,x)=>fs.writeFileSync("./data/"+n,JSON.stringify(x,null,2));
 client.getBalance=id=>{let d=data("balances.json");if(typeof d[id]!=="number"){d[id]=config.startingBalance;save("balances.json",d)}return d[id]};
 client.setBalance=(id,a)=>{let d=data("balances.json");d[id]=Math.max(0,Math.floor(a));save("balances.json",d);return d[id]};
 client.log=async(g,t,d)=>{if(!config.logChannelId)return;const c=g.channels.cache.get(config.logChannelId);if(c?.isTextBased())c.send({embeds:[new EmbedBuilder().setTitle(t).setDescription(d).setTimestamp()]}).catch(()=>{})};
 client.once("ready",async()=>{console.log("✅ "+client.user.tag+" online");const r=new REST({version:"10"}).setToken(config.token);await r.put(Routes.applicationCommands(config.clientId),{body:[...client.commands.values()].map(x=>x.data.toJSON())});client.user.setActivity("/help | درهم")});
 client.on("interactionCreate",async i=>{if(!i.isChatInputCommand())return;const c=client.commands.get(i.commandName);if(!c)return;try{await c.execute(i,client)}catch(e){console.error(e);if(!i.replied)await i.reply({content:"❌ وقع خطأ.",ephemeral:true})}});
 client.on("guildMemberAdd",async m=>{if(config.autoRoleId)m.roles.add(config.autoRoleId).catch(()=>{});if(config.welcomeChannelId){const c=m.guild.channels.cache.get(config.welcomeChannelId);c?.send(config.welcomeMessage.replace("{user}",String(m))).catch(()=>{})}});
 const spam=new Map();client.on("messageCreate",async m=>{if(m.author.bot||!m.guild||!config.automod.enabled)return;let a=(spam.get(m.author.id)||[]).filter(t=>Date.now()-t<config.automod.windowSeconds*1000);a.push(Date.now());spam.set(m.author.id,a);if(a.length>=config.automod.maxMessages){if(m.member?.moderatable)await m.member.timeout(config.automod.timeoutMinutes*60000,"AutoMod").catch(()=>{});await m.delete().catch(()=>{});spam.delete(m.author.id)}});
 client.login(config.token);
}else console.error("❌ ضع token و clientId في config.json");