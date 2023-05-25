require('dotenv').config();
const express = require('express');
const axios = require('axios');
const {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} = require('discord-interactions');

const app = express();
const discord_api = axios.create({
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
    if (interaction.data.name === 'yo') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if (interaction.data.name === 'dm') {
      // ...
    }

    if (interaction.data.name === 'ip') {
      // ...
    }

    if (interaction.data.name === 'unshorten') {
      const url = interaction.data.options[0].value;

      try {
        const response = await axios.get(`https://unshorten.me/s/${url}`);
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
            content: 'Failed to unshorten the URL.',
          },
        });
      }
    }

    if (interaction.data.name === 'qrcode') {
      const url = interaction.data.options[0].value;
      const qrCodeUrl = `https://chart.apis.google.com/chart?cht=qr&chs=500x500&chld=H|0&chl=${url}`;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: qrCodeUrl,
        },
      });
    }

    if (interaction.data.name === 'animeq') {
      try {
        const response = await axios.get('https://animechan.vercel.app/api/random');
        const { anime, character, quote } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Anime: ${anime}\nCharacter: ${character}\nQuote: ${quote}`,
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
    }

    if (interaction.data.name === 'shorten') {
      const url = interaction.data.options[0].value;

      try {
        const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${url}`);
        const { ok, result } = response.data;

        if (ok) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Shortened URL: ${result.full_short_link}\nShortened URL 2: ${result.full_short_link2}\nShortened URL 3: ${result.full_short_link3}`,
            },
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Failed to shorten the URL.',
            },
          });
        }
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to shorten the URL.',
          },
        });
      }
    }
  }
});

app.get('/register_commands', async (req, res) => {
  const slash_commands = [
    {
      name: 'yo',
      description: 'Replies with Yo!',
      options: [],
    },
    {
      name: 'dm',
      description: 'Sends user a DM',
      options: [],
    },
    {
      name: 'ip',
      description: 'Checks IP information',
      options: [
        {
          name: 'ip_address',
          description: 'The IP address to check',
          type: 3, // String type
          required: true,
        },
      ],
    },
    {
      name: 'unshorten',
      description: 'Unshortens a shortened URL',
      options: [
        {
          name: 'url',
          description: 'The shortened URL to unshorten',
          type: 3, // String type
          required: true,
        },
      ],
    },
    {
      name: 'qrcode',
      description: 'Generates a QR code for a URL',
      options: [
        {
          name: 'url',
          description: 'The URL to generate a QR code for',
          type: 3, // String type
          required: true,
        },
      ],
    },
    {
      name: 'animeq',
      description: 'Fetches a random anime quote',
      options: [],
    },
    {
      name: 'shorten',
      description: 'Shortens a URL',
      options: [
        {
          name: 'url',
          description: 'The URL to shorten',
          type: 3, // String type
          required: true,
        },
      ],
    },
  ];

  try {
    const discord_response = await discord_api.put(
      `/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD_ID}/commands`,
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
