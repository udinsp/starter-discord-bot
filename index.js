require('dotenv').config();
const express = require('express');
const axios = require('axios');
const {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} = require('discord-interactions');

const app = express();

const discordApi = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Authorization',
    Authorization: `Bot ${process.env.TOKEN}`,
  },
});

app.use(express.json());

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    switch (interaction.data.name) {
      case 'animeq':
        try {
          const response = await axios.get('https://animechan.vercel.app/api/random');
          const animeQuote = response.data;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Anime: ${animeQuote.anime}\nCharacter: ${animeQuote.character}\nQuote: ${animeQuote.quote}`,
            },
          });
        } catch (error) {
          console.log(error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to fetch anime quote.',
            },
          });
        }

      case 'shorten':
        const urlToShorten = interaction.data.options[0].value;
        try {
          const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(urlToShorten)}`);
          const shortenedUrl = response.data.result.full_short_link;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Shortened URL: ${shortenedUrl}`,
            },
          });
        } catch (error) {
          console.log(error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to shorten URL.',
            },
          });
        }

      case 'unshorten':
        const urlToUnshorten = interaction.data.options[0].value;
        try {
          const response = await axios.get(`https://unshorten.me/s/${encodeURIComponent(urlToUnshorten)}`);
          const unshortenedUrl = response.data;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Unshortened URL: ${unshortenedUrl}`,
            },
          });
        } catch (error) {
          console.log(error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to unshorten URL.',
            },
          });
        }

      case 'qrcode':
        const textForQrCode = interaction.data.options[0].value;
        const qrCodeUrl = `https://chart.apis.google.com/chart?cht=qr&chs=500x500&chld=H|0&chl=${encodeURIComponent(
          textForQrCode
        )}`;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: qrCodeUrl,
          },
        });

      case 'ip':
        const ipAddress = interaction.data.options[0].value;
        try {
          const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
          const ipData = response.data;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `IP Address: ${ipData.ip}\nNetwork: ${ipData.network}\nVersion: ${ipData.version}\nCity: ${ipData.city}\nRegion: ${ipData.region}\nCountry: ${ipData.country_name}\nContinent: ${ipData.continent_code}\nLatitude: ${ipData.latitude}\nLongitude: ${ipData.longitude}\nTimezone: ${ipData.timezone}\nCurrency: ${ipData.currency}\nLanguages: ${ipData.languages}\nASN: ${ipData.asn}\nOrganization: ${ipData.org}`,
            },
          });
        } catch (error) {
          console.log(error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to fetch IP information.',
            },
          });
        }

      case 'ping':
        const startTimestamp = Date.now();
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Pinging...',
          },
        });

      default:
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Invalid command.',
          },
        });
    }
  }
});

app.get('/register-commands', async (req, res) => {
  try {
    const commands = [
      {
        name: 'animeq',
        description: 'Get a random anime quote.',
      },
      {
        name: 'shorten',
        description: 'Shorten a URL.',
        options: [
          {
            name: 'url',
            description: 'The URL to shorten.',
            type: 3, // String type
            required: true,
          },
        ],
      },
      {
        name: 'unshorten',
        description: 'Unshorten a shortened URL.',
        options: [
          {
            name: 'url',
            description: 'The shortened URL to unshorten.',
            type: 3, // String type
            required: true,
          },
        ],
      },
      {
        name: 'qrcode',
        description: 'Generate a QR code from a text.',
        options: [
          {
            name: 'text',
            description: 'The text to encode into a QR code.',
            type: 3, // String type
            required: true,
          },
        ],
      },
      {
        name: 'ip',
        description: 'Get information about an IP address.',
        options: [
          {
            name: 'ip_address',
            description: 'The IP address to lookup.',
            type: 3, // String type
            required: true,
          },
        ],
      },
      {
        name: 'ping',
        description: 'Check the ping to the server.',
      },
    ];

    await discordApi.put(`/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD_ID}/commands`, commands);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
