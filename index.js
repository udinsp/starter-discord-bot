require('dotenv').config();
const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;
const API_IPQUALITYSCORE = process.env.API_IPQUALITYSCORE;

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
          content: `Dalem ${interaction.member.user.username}!`,
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
          content: 'Ada yang bisa saya bantu bang?',
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

        const formattedData = `IP Address: ${ipData.ip}\nNetwork: ${ipData.network}\nVersion: ${ipData.version}\nCity: ${ipData.city}\nRegion: ${ipData.region}\nCountry: ${ipData.country_name}\nContinent: ${ipData.continent_code}\nLatitude: ${ipData.latitude}\nLongitude: ${ipData.longitude}\nTimezone: ${ipData.timezone}\nCurrency: ${ipData.currency}\nLanguages: ${ipData.languages}\nASN: ${ipData.asn}\nOrganization: ${ipData.org}`;

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
	
	if (interaction.data.name === 'phonevalid') {
      const number = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://www.ipqualityscore.com/api/json/phone/${API_IPQUALITYSCORE}/${number}`);
        const numberData = response.data;

        const formattedData = `Formatted: ${numberData.formatted}\nLocal Format: ${numberData.local_format}\nValid: ${numberData.valid}\nName: ${numberData.name}\nLeaked: ${numberData.leaked}\nSpammer: ${numberData.spammer}\nFraud Score: ${numberData.fraud_score}\nRecent Abuse: ${numberData.recent_abuse}\nVOIP: ${numberData.VOIP}\nPrepaid: ${numberData.prepaid}\nRisky: ${numberData.risky}\nActive: ${numberData.active}\nCarrier: ${numberData.carrier}\nLine Type: ${numberData.line_type}\nCountry: ${numberData.country}\nDialing Code: ${numberData.dialing_code}\nTimezone: ${numberData.timezone}`;

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
            content: 'Failed to fetch Phone Number information.'
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
	
	if (interaction.data.name === 'dnslookup') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/dnslookup/?q=${encodeURIComponent(url)}`);
        const resultdnslookup = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resultdnslookup,
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
            content: 'Failed to Lookup DNS.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'reversedns') {
      const ipAddress = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/reversedns/?q=${encodeURIComponent(ipAddress)}`);
        const resultreversedns = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resultreversedns,
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
            content: 'Failed to Reverse DNS.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'findshareddns') {
      const ns = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/findshareddns/?q=${encodeURIComponent(ns)}`);
        const resultfindshareddns = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resultfindshareddns,
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
            content: 'Failed to Find Shared DNS Servers.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'hostsearch') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(url)}`);
        const resulthostsearch = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resulthostsearch,
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
            content: 'Failed to Find DNS Host Records (Subdomains).'
          }
        });
      }
    }
	
	if (interaction.data.name === 'reverseiplookup') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/reverseiplookup/?q=${encodeURIComponent(url)}`);
        const resultreverseiplookup = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resultreverseiplookup,
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
            content: 'Failed to Reverse IP Lookup.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'pagelinks') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/pagelinks/?q=${encodeURIComponent(url)}`);
        const resultpagelinks = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resultpagelinks,
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
            content: 'Failed to Extract Links From Page.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'httpheaders') {
      const url = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(url)}`);
        const resulthttpheaders = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: resulthttpheaders,
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
            content: 'Failed to HTTP Header Check.'
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
	
	if (interaction.data.name === 'dailyq') {
      try {
        const response = await axios.get('https://zenquotes.io/api/random');
        const quoteData = response.data[0];
        const { q: quote, a: character } = quoteData;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${q}\n\n** ${a} **`,
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
      "name": "phonevalid",
      "description": "Validates a phone number and returns its details",
      "options": [
        {
          "name": "number",
          "description": "The phone number to validate. Example 6289123456789",
          "type": 3,
          "required": true
        }
      ]
    },
    {
      "name": "shorten",
      "description": "Shorten a URL",
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
      "description": "Unshorten a URL",
      "options": [
        {
          "name": "url",
          "description": "URL to unshorten",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "dnslookup",
      "description": "Performs a DNS lookup for a given domain and returns the corresponding IP address",
      "options": [
        {
          "name": "domain",
          "description": "The domain to perform the DNS lookup on",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "reversedns",
      "description": "Performs a reverse DNS lookup for a given IP address and returns the corresponding domain name",
      "options": [
        {
          "name": "ip_address",
          "description": "The IP address to perform the reverse DNS lookup on",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "findshareddns",
      "description": "Finds shared DNS servers between multiple domains using a specific nameserver",
      "options": [
        {
          "name": "nameserver",
          "description": "The nameserver to use for finding shared DNS servers",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "hostsearch",
      "description": "Finds DNS host records (subdomains) for a given domain",
      "options": [
        {
          "name": "domain",
          "description": "The domain for which to find DNS host records (subdomains)",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "reverseiplookup",
      "description": "Performs a reverse IP lookup to find the associated domain(s) for a given IP address",
      "options": [
        {
          "name": "ip_or_domain",
          "description": "The IP address or domain for which to perform the reverse IP lookup",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "pagelinks",
      "description": "Extracts links from a web page and returns a list of the extracted links",
      "options": [
        {
          "name": "url",
          "description": "The URL of the web page from which to extract links",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "httpheaders",
      "description": "Performs an HTTP header check on a given URL and returns the headers of the HTTP response",
      "options": [
        {
          "name": "url",
          "description": "The URL to perform the HTTP header check on",
          "type": 3,
          "required": true
        }
      ]
    },
    {
      "name": "qrcode",
      "description": "Generates a QR code",
      "options": [
        {
          "name": "text",
          "description": "Text for the QR code",
          "type": 3,
          "required": true
        }
      ]
    },
	{
      "name": "dailyq",
      "description": "Displays a random inspirational or motivational quote every day",
      "options": []
    },
    {
      "name": "animeq",
      "description": "Fetches a random anime quote",
      "options": []
    }
  ];

  try {
    await discord_api.put(`/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`, slash_commands);
    res.send('Slash commands registered successfully.');
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to register slash commands.');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
