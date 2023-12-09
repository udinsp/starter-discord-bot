require('dotenv').config();
const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;
const API_IPQUALITYSCORE = process.env.API_IPQUALITYSCORE;
const APILAYER = process.env.APILAYER;
const IP2WHOIS = process.env.IP2WHOIS;

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
    if (interaction.data.name === 'halo') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Halo juga ${interaction.member.user.username}!`,
        },
      });
    }

    if (interaction.data.name === 'pics_jkt48') {
      try {
        const response = await axios.get('https://jkt48.pakudin.my.id/api/jkt48');
        const { url } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                image: {
				        	      url: url
				        },
                color: 16611074
              }
            ]
          }
        });
      } catch (error) {
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to fetch jkt48 member image.'
          }
        });
      }
    }

    if (interaction.data.name === 'truecaller') {
      const number = interaction.data.options[0].value;
      try {
        const response = await axios.get(`https://tcl.pakudin.my.id/search?q=${number}`);
        const numberData = response.data.data[0];

        const formattedData = `**Name**: ${numberData.name || '-'}\n**Alt Name**: ${numberData.altName || '-'}\n**Score**: ${numberData.score || '-'}\n**Email**: ${numberData.internetAddresses[0]?.id || '-'}`;

			  const infoNomer = numberData.phones[0] || {};
			  const infoSpam = numberData.spamInfo || {};
        const infoProfile = numberData.image || "https://cdn.discordapp.com/attachments/372358599625801731/1182968014975553586/blank-profile-picture-973460_960_720.png";

			  const infoNomerText = `\n**Info Number**\nProvider: ${infoNomer.carrier || '-'}\nInternational Format: ${infoNomer.e164Format || '-'}\nLocal Format: ${infoNomer.nationalFormat || '-'}\nNumber Type: ${infoNomer.numberType || '-'}`;

			  let infoSpamText = '';
			  let spamStatsText = '';

			  if (infoSpam.spamScore !== undefined && infoSpam.spamType !== undefined) {
			  	const spamStats = infoSpam.spamStats;
			  	infoSpamText = `**Info Spam**\nSpam Score: ${infoSpam.spamScore}\nSpam Type: ${infoSpam.spamType}\nSpammer Type: ${spamStats.spammerType || '-'}`;
			  }

		  	if (infoSpam.spamStats !== undefined) {
				  const spamStats = infoSpam.spamStats;
				  spamStatsText = `**Spam Stats**\nJumlah Laporan: ${spamStats.numReports || '-'}\nJumlah Laporan Dalam 60 Hari: ${spamStats.numReports60days || '-'}\nJumlah Pencarian Dalam 60 Hari: ${spamStats.numSearches60days || '-'}\nJumlah Panggilan Dalam 60 Hari: ${spamStats.numCalls60days || '-'}\nJumlah Panggilan Tidak Terjawab: ${spamStats.numCallsNotAnswered || '-'}\nJumlah Panggilan Terjawab: ${spamStats.numCallsAnswered || '-'}`;
		  	}

			  const finalMessage = `${infoNomerText}${infoSpamText ? `\n\n${infoSpamText}` : ''}${spamStatsText ? `\n\n${spamStatsText}` : ''}`;

        const FinalNum = `${formattedData}\n${finalMessage}`
        
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: FinalNum,
                color: 16611074,
                thumbnail: {
                  url: infoProfile
                }
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

  }
});

app.get('/register_commands', async (req, res) => {
  let slash_commands = [
    {
      "name": "halo",
      "description": "Replies with Halo!",
      "options": []
    },
    {
      "name": "pics_jkt48",
      "description": "Random Pictures of JKT48 Members",
      "options": []
    },
    {
      "name": "truecaller",
      "description": "Truecaller was created to identify who was calling",
      "options": [
        {
          "name": "number",
          "description": "The phone number to validate. Example 6289123456789",
          "type": 3,
          "required": true
        }
      ]
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
