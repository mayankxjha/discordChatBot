require('dotenv/config')
const express = require('express')
const index = express();
const {Client, IntentsBitField} = require('discord.js')
const {Configuration, OpenAIApi} = require('openai')

index.get('/', (req, res)=>{
    res.send("<h1>It do be working</h1>")
})
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});
client.on('ready', () => {
    console.log("The bot is online")
})

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})
const openai = new OpenAIApi(configuration)
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.id != process.env.CHANNEL_ID) return;
    if (message.content.startsWith('.')) return;

    let conversationLog = [{role: 'system', content: "You are a sarcastic chatbot."}]

    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({limit: 15})
    prevMessages.reverse()

    prevMessages.forEach(msg=>{
        if(message.content.startsWith('.')) return;
        if(msg.author.id !== client.user.id && message.author.bot) return;
        if(msg.author.id !== message.author.id) return;

        conversationLog.push({
            role : 'user',
            content: msg.content
        })
    })
    conversationLog.push({
        role: "user",
        content: message.content
    })

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog
    })
    message.reply(result.data.choices[0].message)
})
client.login(process.env.TOKEN)

index.listen(3000, () => {
    console.log("Server is listening at port 3000");
});