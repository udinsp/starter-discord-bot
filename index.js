// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config();
const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;

const axios = require('axios');
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Authorization",
    "Authorization": `Bot ${TOKEN}`
  }
});

app.use(express.json());

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name);
    if (interaction.data.name === 'yo') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if (interaction.data.name === 'dm') {
      // https://discord.com/developers/docs/resources/user#create-dm
      let c = (await discord_api.post(`/users/@me/channels`, {
        recipient_id: interaction.member.user.id
      })).data;
      try {
        // https://discord.com/developers/docs/resources/channel#create-message
        let res = await discord_api.post(`/channels/${c.id}/messages`, {
          content: 'Yo! I got your slash command. I am not able to respond to DMs, just slash commands.',
        });
        console.log(res.data);
      } catch (e) {
        console.log(e);
      }

      return res.send({
        // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '👍'
        }
      });
    }

    if (interaction.data.name === 'ip') {
      const ipAddress = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        const ipData = response.data;

        // Format the response data
        const formattedData = `
        IP Address: ${ipData.ip}
        Network: ${ipData.network}
        Version: ${ipData.version}
        City: ${ipData.city}
        Region: ${ipData.region}
        Country: ${ipData.country_name}
        Continent: ${ipData.continent_code}
        Latitude: ${ipData.latitude}
        Longitude: ${ipData.longitude}
        Timezone: ${ipData.timezone}
        Currency: ${ipData.currency}
        Languages: ${ipData.languages}
        ASN: ${ipData.asn}
        Organization: ${ipData.org}
        `;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `\`\`\`${formattedData}\`\`\``
          }
        });
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to fetch IP information. Please make sure you provided a valid IP address.'
          }
        });
      }
    }
  }
});

app.get('/register_commands', async (req, res) => {
  let slash_commands = [
    {
      "name": "yo",
      "description": "Replies with Yo!",
      "options": []
    },
    {
      "name": "dm",
      "description": "Sends user a DM",
      "options": []
    },
    {
      "name": "ip",
      "description": "Checks information about an IP address",
      "options": [
        {
          "name": "address",
          "description": "IP address to check",
          "type": 3, // Type 3 represents STRING type
          "required": true
        }
      ]
    }
  ];

  try {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    );

    console.log(discord_response.data);
    return res.send('Commands have been registered');
  } catch (e) {
    console.error(e.code);
    console.error(e.response?.data);
    return res.send(`${e.code} error from Discord`);
  }
});

app.get('/', async (req, res) => {
  return res.send('Follow the documentation');
});

app.listen(8999, () => {
  console.log('Server is running on port 8999');
});
