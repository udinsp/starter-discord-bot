require('dotenv').config();
const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;
const API_IPQUALITYSCORE = process.env.API_IPQUALITYSCORE;
const BARD_API = process.env.BARD_API;

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
	
	if (interaction.data.name === 'bard') {
		const text = interaction.data.options[0].value;
		try {
			const response = await fetch("https://api.bardapi.dev/chat", {
				headers: { Authorization: `Bearer ${BARD_API}` },
				method: "POST",
				body: JSON.stringify({ input: `${text}` }),
		});
		const data = await response.json();
		const bardOut = data.output;

		const responseData = {
			type: 4,
			data: {
				embeds: [
				{
				description: bardOut,
				color: null
			}
			]
		  }
		};

		// Send the response back as an HTTP response
		res.status(200).json(responseData);
		} catch (error) {
		console.log(error);
		return res.send({
			type: 4,
			data: {
				content: 'Failed to connect to Google Bard.'
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
                description: `${quote}\n\n** ${character} **`,
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
            content: 'Failed to fetch quote.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'dailyq2') {
      try {
        const response = await axios.get('https://api.quotable.io/quotes/random');
        const quoteData = response.data[0];
        const { content, author } = quoteData;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${content}\n\n**${author}**`,
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
            content: 'Failed to fetch quote.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'stoicq') {
      try {
        const response = await axios.get('https://api.themotivate365.com/stoic-quote');
        const { author, quote } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${quote}\n\n**${author}**`,
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
            content: 'Failed to fetch stoic quote.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'ronq') {
      try {
        const response = await axios.get('http://ron-swanson-quotes.herokuapp.com/v2/quotes');
        const quote = response.data[0];

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${quote}\n\n**Ron Swanson**`,
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
            content: 'Failed to fetch Ron Swanson Quote.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'kanyeq') {
      try {
        const response = await axios.get('https://api.kanye.rest');
        const { quote } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${quote}\n\n**Kanye West**`,
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
            content: 'Failed to fetch Kanye West Quote.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'chuckj') {
      try {
        const response = await axios.get('https://api.chucknorris.io/jokes/random');
        const { value } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${value}\n\n**Chuck Norris**`,
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
            content: 'Failed to fetch Chuck Norris joke.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'jokes') {
      try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const { setup, punchline } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `**${setup}**\n\n${punchline}`,
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
            content: 'Failed to fetch random joke.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'evil') {
      try {
        const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
        const { insult } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${insult}`,
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
            content: 'Failed to fetch evil insult.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'activity') {
      try {
        const response = await axios.get('https://www.boredapi.com/api/activity');
        const { activity, type, participants } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `Activity: ${activity}\nType: ${type}\nParticipants: ${participants}`,
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
            content: 'Failed to fetch random activity.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'fcat') {
      try {
        const response = await axios.get('https://catfact.ninja/fact');
        const { fact } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                description: `${fact}`,
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
            content: 'Failed to fetch cat fact.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'pcat') {
      try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const [{ url }] = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                image: {
					url: url
				},
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
            content: 'Failed to fetch cat image.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'pdog') {
      try {
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        const { message: imageUrl } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                image: {
					url: imageUrl
				},
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
            content: 'Failed to fetch dog image.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'pfox') {
      try {
        const response = await axios.get('https://randomfox.ca/floof/');
        const { image } = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                image: {
					url: image
				},
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
            content: 'Failed to fetch fox image.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'pshiba') {
      try {
        const response = await axios.get('https://shibe.online/api/shibes');
        const [imageUrl] = response.data;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                image: {
					url: imageUrl
				},
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
            content: 'Failed to fetch Shiba Inu dog image.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'randuser') {
      try {
        const response = await axios.get('https://random-data-api.com/api/users/random_user');
        const user = response.data;
		const { first_name, last_name, username, email, phone_number, social_insurance_number, date_of_birth, employment: { title, key_skill }, address: { city, street_name, street_address, zip_code, state, country, coordinates } } = user;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              { 
				title: `${first_name} ${last_name}`,
				description: `Username: ${username}\nEmail: ${email}\nPhone Number: ${phone_number}\nSocial Insurance Number: ${social_insurance_number}\nDate of Birth: ${date_of_birth}`,
				fields: [
				{
					name: 'Employment',
					value: `Title: ${title}\nKey Skill: ${key_skill}`
				},
				{
					name: 'Address',
					value: `City: ${city}\nStreet Name: ${street_name}\nStreet Address: ${street_address}\nZip Code: ${zip_code}\nState: ${state}\nCountry: ${country}`
				},
				{
					name: 'Coordinates',
					value: `Latitude: ${coordinates.lat}\nLongitude: ${coordinates.lng}`
				}
				],
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
            content: 'Failed to fetch random user data.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'randuser2') {
      try {
        const response = await axios.get('https://randomuser.me/api/');
        const user = response.data.results[0];
		const { gender, name: { title, first, last }, location: { street: { number, name }, city, state, country, postcode, coordinates: { latitude, longitude }, timezone: { offset, description } }, email, dob: { date, age }, registered: { date: registeredDate, age: registeredAge }, phone, cell, id: { name: idName, value: idValue }, picture: { large }, nat } = user;
		

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              { 
				title: `${title} ${first} ${last}`,
				description: `Gender: ${gender}\nEmail: ${email}\nDate of Birth: ${date}\nAge: ${age}\nRegistered Date: ${registeredDate}\nRegistered Age: ${registeredAge}`,
				fields: [
				{
					name: 'Address',
					value: `Street: ${number} ${name}\nCity: ${city}\nState: ${state}\nCountry: ${country}\nPostcode: ${postcode}\nCoordinates: ${latitude}, ${longitude}\nTimezone: ${offset} - ${description}`
				},
				{
					name: 'Contact',
					value: `Phone: ${phone}\nCell: ${cell}`
				},
				{
					name: 'Identification',
					value: `ID Name: ${idName}\nID Value: ${idValue}`
				}
				],
				thumbnail: {
					url: large
				},
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
            content: 'Failed to fetch random user data.'
          }
        });
      }
    }
	
	if (interaction.data.name === 'randuser3') {
      try {
        const response = await axios.get('https://fakerapi.it/api/v1/persons?_quantity=1');
        const user = response.data.data[0];
		const { id, firstname, lastname, email, phone, birthday, gender, address: { street, streetName, buildingNumber, city, zipcode, country, county_code, latitude, longitude } } = user;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              { 
				title: `${firstname} ${lastname}`,
				description: `Gender: ${gender}\nEmail: ${email}\nBirthday: ${birthday}`,
				fields: [
				{
					name: 'Address',
					value: `Street: ${street} ${streetName} ${buildingNumber}\nCity: ${city}\nZipcode: ${zipcode}\nCountry: ${country}\nCounty Code: ${county_code}\nCoordinates: ${latitude}, ${longitude}`
				},
				{
					name: 'Contact',
					value: `Phone: ${phone}`
				}
				],
				thumbnail: {
					url: large
				},
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
            content: 'Failed to fetch random user data.'
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
      "name": "bard",
      "description": "Google Bard AI ChatBot",
      "options": [
        {
          "name": "text",
          "description": "Enter your question",
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
      "name": "dailyq2",
      "description": "Displays a random inspirational or motivational quote every day",
      "options": []
    },
	{
      "name": "stoicq",
      "description": "Stoicism Quotes",
      "options": []
    },
	{
      "name": "ronq",
      "description": "Ron Swanson Quotes",
      "options": []
    },
	{
      "name": "kanyeq",
      "description": "Kanye West Quotes",
      "options": []
    },
	{
      "name": "chuckj",
      "description": "Chuck Norris Jokes",
      "options": []
    },
	{
      "name": "jokes",
      "description": "Random Jokes",
      "options": []
    },
	{
      "name": "evil",
      "description": "Random Evil Insult",
      "options": []
    },
	{
      "name": "activity",
      "description": "Random Activity Recommendations",
      "options": []
    },
	{
      "name": "fcat",
      "description": "Random Cat Facts",
      "options": []
    },
	{
      "name": "pcat",
      "description": "Random Pictures Of Cats",
      "options": []
    },
	{
      "name": "pdog",
      "description": "Random Pictures Of Dogs",
      "options": []
    },
	{
      "name": "pfox",
      "description": "Random Pictures Of Foxes",
      "options": []
    },
	{
      "name": "pshiba",
      "description": "Random Pictures Of Shiba Inu Dogs",
      "options": []
    },
	{
      "name": "randuser",
      "description": "Random User Generator",
      "options": []
    },
	{
      "name": "randuser2",
      "description": "Random User Generator",
      "options": []
    },
	{
      "name": "randuser3",
      "description": "Random User Generator",
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
