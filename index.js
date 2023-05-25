require('dotenv').config();
const express = require('express');
const axios = require('axios');
const {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} = require('discord-interactions');

const app = express();
app.use(express.json());

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

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const command = interaction.data.name;
    const options = interaction.data.options || [];

    if (command === 'animeq') {
      // Perintah animeq
      // Panggil API animeq untuk mendapatkan kutipan acak
      const response = await axios.get('https://animechan.vercel.app/api/random');
      const { anime, character, quote } = response.data;
      const content = `**${anime}** - ${character}: ${quote}`;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content,
        },
      });
    } else if (command === 'shorten') {
      // Perintah shorten
      // Dapatkan URL yang akan dipersingkat dari opsi yang diberikan
      const url = options.find((option) => option.name === 'url').value;
      // Panggil API shorten untuk mempersingkat URL
      const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
      const { ok, result } = response.data;
      const shortLink = result.full_short_link || result.short_link;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Shortened URL: ${shortLink}`,
        },
      });
    } else if (command === 'unshorten') {
      // Perintah unshorten
      // Dapatkan URL yang akan di-unshorten dari opsi yang diberikan
      const url = options.find((option) => option.name === 'url').value;
      // Panggil API unshorten untuk mengembalikan URL asli dari URL yang di-unshorten
      const response = await axios.get(`https://unshorten.me/s/${encodeURIComponent(url)}`);
      const unshortenedUrl = response.data;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unshortened URL: ${unshortenedUrl}`,
        },
      });
    } else if (command === 'qrcode') {
      // Perintah qrcode
      // Dapatkan teks yang akan dijadikan QR code dari opsi yang diberikan
      const text = options.find((option) => option.name === 'text').value;
      // Format URL untuk menghasilkan gambar QR code
      const qrCodeUrl = `https://chart.apis.google.com/chart?cht=qr&chs=500x500&chld=H|0&chl=${encodeURIComponent(
        text
      )}`;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: qrCodeUrl,
        },
      });
    } else if (command === 'ip') {
      // Perintah ip
      // Dapatkan alamat IP yang akan dicari informasinya dari opsi yang diberikan
      const ipAddress = options.find((option) => option.name === 'ip_address').value;
      // Panggil API ipapi untuk mendapatkan informasi tentang alamat IP
      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
      const ipData = response.data;

      const content = `
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
          content,
        },
      });
    }
  }

  res.send({
    type: InteractionResponseType.PONG,
  });
});

app.get('/register_commands', async (req, res) => {
  try {
    const commands = [
      // Perintah animeq
      {
        name: 'animeq',
        description: 'Get a random anime quote.',
      },
      // Perintah shorten
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
      // Perintah unshorten
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
      // Perintah qrcode
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
      // Perintah ip
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
    ];

    await discordApi.put(`/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD_ID}/commands`, commands);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
