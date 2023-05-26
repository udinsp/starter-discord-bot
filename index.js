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
			embeds: [
			{
				description: formattedData,
				color: null
			}
			]
		}
		});
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to fetch IP information.'
          }
        });
      }
    }

    if (interaction.data.name === 'shorten') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
        const shortenData = response.data;
        const { full_short_link, full_short_link2, full_short_link3 } = shortenData.result;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
			embeds: [
			{
				description: `Shortened URLs:\n1. ${full_short_link}\n2. ${full_short_link2}\n3. ${full_short_link3}`,
				color: null
			}
		  ]
          }
        });
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to shorten the URL.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'unshorten') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://unshorten.me/s/${encodeURIComponent(url)}`);
        const unshortenedUrl = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
			embeds: [
			{
				description: `Unshortened URL: ${unshortenedUrl}`,
				color: null
			}
		  ]
          }
        });
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to unshorten the URL.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'qrcode') {
      const text = interaction.data.options.find((option) => option.name === 'text').value;
      const qrCodeUrl = `https://chart.apis.google.com/chart?cht=qr&chs=500x500&chld=H|0&chl=${encodeURIComponent(text)}`;
	  
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
			content: qrCodeUrl,
          }
        });
      }
    }

    if (interaction.data.name === 'animeq') {
      try {
        const response = await axios.get('https://animechan.vercel.app/api/random');
        const quoteData = response.data;
        const { anime, character, quote } = quoteData;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
			embeds: [
			{
				description: `${quote}\n\n** ${character} - ${anime} **`,
				color: null
			}
			]
          }
        });
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to fetch anime quote.'
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
      "description": "Fetches information about an IP address",
      "options": [
        {
          "name": "ip_address",
          "description": "IP address to fetch information",
          "type": 3,
          "required": true
        }
      ]
    },
    {
      "name": "shorten",
      "description": "Shortens a URL",
      "options": [
        {
          "name": "url",
          "description": "URL to shorten",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "unshorten",
      "description": "Unshorten a shortened URL",
      "options": [
        {
          "name": "url",
          "description": "The shortened URL to unshorten",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "qrcode",
      "description": "Generate a QR code from a text",
      "options": [
        {
          "name": "text",
          "description": "The text to encode into a QR code",
          "type": 3,
          "required": true
        }
      ]
    },
    {
      "name": "animeq",
      "description": "Fetches a random anime quote",
      "options": []
    }
  ];

  try {
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
