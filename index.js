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
const {
	InteractionType,
	InteractionResponseType,
	verifyKeyMiddleware
} = require('discord-interactions');

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

		if (interaction.data.name === 'iplookup') {
			const ipAddress = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
				const ipData = response.data;

				const formattedData = `IP Address: ${ipData.ip}\nNetwork: ${ipData.network}\nVersion: ${ipData.version}\nCity: ${ipData.city}\nRegion: ${ipData.region}\nCountry: ${ipData.country_name}\nContinent: ${ipData.continent_code}\nLatitude: ${ipData.latitude}\nLongitude: ${ipData.longitude}\nTimezone: ${ipData.timezone}\nCurrency: ${ipData.currency}\nLanguages: ${ipData.languages}\nASN: ${ipData.asn}\nOrganization: ${ipData.org}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
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

		if (interaction.data.name === 'iplookup2') {
			const ipAddress = interaction.data.options[0].value;
			try {
				const response = await axios.get(`http://free.ipwhois.io/json/${ipAddress}`);
				const ipData = response.data;

				const formattedData = `IP Address: ${ipData.ip}\nType: ${ipData.type}\nCity: ${ipData.city}\nRegion: ${ipData.region}\nCountry: ${ipData.country}\nCountry Code: ${ipData.country_code}\nCountry Capital: ${ipData.country_capital}\nCountry Phone: ${ipData.country_phone}\nCountry Neighbours: ${ipData.country_neighbours}\nContinent: ${ipData.continent}\nContinent Code: ${ipData.continent_code}\nLatitude: ${ipData.latitude}\nLongitude: ${ipData.longitude}\nASN: ${ipData.asn}\nORG: ${ipData.org}\nISP: ${ipData.isp}\nTimezone: ${ipData.timezone}\nTimezone Name: ${ipData.timezone_name}\nTimezone GMT: ${ipData.timezone_gmt}\nCurrency: ${ipData.currency}\nCurrency Code: ${ipData.currency_code}\nCurrency Symbol: ${ipData.currency_symbol}\nCurrency Rates: ${ipData.currency_rates}\nCurrency Plural: ${ipData.currency_plural}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
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

		if (interaction.data.name === 'iplookup3') {
			const ipAddress = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://www.iplocate.io/api/lookup/${ipAddress}`);
				const ipData = response.data;

				const formattedData = `IP Address: ${ipData.ip}\nCity: ${ipData.city}\nRegion: ${ipData.subdivision}\nCountry: ${ipData.country}\nCountry Code: ${ipData.country_code}\nContinent: ${ipData.continent}\nLatitude: ${ipData.latitude}\nLongitude: ${ipData.longitude}\nTime Zone: ${ipData.time_zone}\nNetwork: ${ipData.network}\nOrganization: ${ipData.org}\nASN: ${ipData.asn}\nASN Network: ${ipData.asn_network}\nIs EU: ${ipData.is_eu}\nIs Proxy: ${ipData.threat.is_proxy}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
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
						embeds: [{
							description: formattedData,
							color: null
						}]
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

		if (interaction.data.name === 'phonevalid2') {
			const number = interaction.data.options[0].value;
			try {
				const response = await axios.get(`http://phone-number-api.com/json/?number=${number}`);
				const numberData = response.data;

				const formattedData = `Formatted: ${numberData.formatE164}\nLocal Format: ${numberData.formatNational}\nValid: ${numberData.numberValid}\nNumber Type: ${numberData.numberType}\nCountry Code: ${numberData.numberCountryCode}\nCarrier: ${numberData.carrier}\nContinent: ${numberData.continent}\nCountry: ${numberData.countryName}\nRegion: ${numberData.regionName}\nCity: ${numberData.city}\nTimezone: ${numberData.timezone}\nCurrency: ${numberData.currency}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
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

		if (interaction.data.name === 'phonevalid3') {
			const number = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://api.apilayer.com/number_verification/validate?apikey=${APILAYER}&number=${number}`);
				const numberData = response.data;

				const formattedData = `Valid: ${numberData.valid}\nNumber: ${numberData.number}\nLocal Format: ${numberData.local_format}\nInternational Format: ${numberData.international_format}\nCountry Prefix: ${numberData.country_prefix}\nCountry Code: ${numberData.country_code}\nCountry Name: ${numberData.country_name}\nCarrier: ${numberData.carrier}\nLine Type: ${numberData.line_type}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
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

		if (interaction.data.name === 'emailvalid') {
			const email = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://www.ipqualityscore.com/api/json/email/${API_IPQUALITYSCORE}/${email}`);
				const emailData = response.data;

				const formattedData = `Valid: ${emailData.valid}\nDisposable: ${emailData.disposable}\nSMTP Score: ${emailData.smtp_score}\nOverall Score: ${emailData.overall_score}\nFirst Name: ${emailData.first_name}\nGeneric: ${emailData.generic}\nCommon: ${emailData.common}\nDNS Valid: ${emailData.dns_valid}\nHoneypot: ${emailData.honeypot}\nDeliverability: ${emailData.deliverability}\nFrequent Complainer: ${emailData.frequent_complainer}\nSpam Trap Score: ${emailData.spam_trap_score}\nCatch All: ${emailData.catch_all}\nTimed Out: ${emailData.timed_out}\nSuspect: ${emailData.suspect}\nRecent Abuse: ${emailData.recent_abuse}\nFraud Score: ${emailData.fraud_score}\nSuggested Domain: ${emailData.suggested_domain}\nLeaked: ${emailData.leaked}\nDomain Age: ${emailData.domain_age.human}\nFirst Seen: ${emailData.first_seen.human}\nSanitized Email: ${emailData.sanitized_email}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
					}
				});
			} catch (error) {
				console.log(error);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Failed to fetch email information.'
					}
				});
			}
		}

		if (interaction.data.name === 'emailvalid2') {
			const email = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://api.apilayer.com/email_verification/${email}?apikey=${APILAYER}`);
				const emailData = response.data;

				const formattedData = `Email: ${emailData.email}\nDid You Mean: ${emailData.did_you_mean}\nUser: ${emailData.user}\nDomain: ${emailData.domain}\nSyntax Valid: ${emailData.syntax_valid}\nDisposable: ${emailData.is_disposable}\nRole Account: ${emailData.is_role_account}\nCatch All: ${emailData.is_catch_all}\nDeliverable: ${emailData.is_deliverable}\nCan Connect SMTP: ${emailData.can_connect_smtp}\nInbox Full: ${emailData.is_inbox_full}\nDisabled: ${emailData.is_disabled}\nMX Records: ${emailData.mx_records}\nFree: ${emailData.free}\nScore: ${emailData.score}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
					}
				});
			} catch (error) {
				console.log(error);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Failed to fetch email information.'
					}
				});
			}
		}

		if (interaction.data.name === 'whoislookup') {
			const domain = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://api.apilayer.com/whois/query?apikey=${APILAYER}&domain=${domain}`);
				const result = response.data.result;
				const status = Array.isArray(result.status) ? result.status.join('\n') : result.status;

				const formattedData = `Domain: ${result.domain_name}\nRegistrar: ${result.registrar}\nCreation Date: ${result.creation_date}\nExpiration Date: ${result.expiration_date}\nName Servers: ${result.name_servers.join(', ')}\nEmails: ${result.emails}\nStatus:\n${status}\nOrganization: ${result.org}\nAddress: ${result.address}\nCity: ${result.city}\nState: ${result.state}\nCountry: ${result.country}\nZipcode: ${result.zipcode}\nDNSSEC: ${result.dnssec}\nUpdated Date: ${result.updated_date}\nWhois Server: ${result.whois_server}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
					}
				});
			} catch (error) {
				console.log(error);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Failed to fetch WHOIS information for the domain.'
					}
				});
			}
		}

		if (interaction.data.name === 'whoislookup2') {
			const domain = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://api.ip2whois.com/v2?key=${IP2WHOIS}&domain=${domain}`);
				const result = response.data;

				const formattedData = `Domain: ${result.domain}\nDomain ID: ${result.domain_id}\nStatus: ${result.status}\nCreate Date: ${result.create_date}\nUpdate Date: ${result.update_date}\nExpire Date: ${result.expire_date}\nDomain Age: ${result.domain_age}\nWhois Server: ${result.whois_server}\nRegistrar:\n  - ID: ${result.registrar.iana_id}\n  - Name: ${result.registrar.name}\n  - URL: ${result.registrar.url}\nRegistrant:\n  - Name: ${result.registrant.name}\n  - Organization: ${result.registrant.organization}\n  - Street Address: ${result.registrant.street_address}\n  - City: ${result.registrant.city}\n  - Region: ${result.registrant.region}\n  - Zip Code: ${result.registrant.zip_code}\n  - Country: ${result.registrant.country}\n  - Phone: ${result.registrant.phone}\n  - Fax: ${result.registrant.fax}\n  - Email: ${result.registrant.email}\nAdmin:\n  - Name: ${result.admin.name}\n  - Organization: ${result.admin.organization}\n  - Street Address: ${result.admin.street_address}\n  - City: ${result.admin.city}\n  - Region: ${result.admin.region}\n  - Zip Code: ${result.admin.zip_code}\n  - Country: ${result.admin.country}\n  - Phone: ${result.admin.phone}\n  - Fax: ${result.admin.fax}\n  - Email: ${result.admin.email}\nTech:\n  - Name: ${result.tech.name}\n  - Organization: ${result.tech.organization}\n  - Street Address: ${result.tech.street_address}\n  - City: ${result.tech.city}\n  - Region: ${result.tech.region}\n  - Zip Code: ${result.tech.zip_code}\n  - Country: ${result.tech.country}\n  - Phone: ${result.tech.phone}\n  - Fax: ${result.tech.fax}\n  - Email: ${result.tech.email}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
					}
				});
			} catch (error) {
				console.log(error);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Failed to fetch WHOIS information for the domain.'
					}
				});
			}
		}

		if (interaction.data.name === 'shorten') {
			const url = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
				const shortenData = response.data;
				const {
					full_short_link,
					full_short_link2,
					full_short_link3
				} = shortenData.result;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `Shortened URLs:\n1. ${full_short_link}\n2. ${full_short_link2}\n3. ${full_short_link3}`,
							color: null
						}]
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

		if (interaction.data.name === 'shorten2') {
			const url = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
				const resultshorten = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `Shortened URL: ${resultshorten}`,
							color: null
						}]
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

		if (interaction.data.name === 'shorten3') {
			const url = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
				const {
					shorturl
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `Shortened URL: ${shorturl}`,
							color: null
						}]
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
						embeds: [{
							description: `Unshortened URL: ${unshortenedUrl}`,
							color: null
						}]
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

		if (interaction.data.name === 'metatagsviewer') {
			const url = interaction.data.options[0].value;
			try {
				const response = await axios.get(`https://api.apilayer.com/meta_tags?apikey=${APILAYER}&url=${url}`);
				const data = response.data;
				let metaTags = '';
				data.meta_tags.forEach(tag => {
					if (tag.name) {
						metaTags += `${tag.name}: ${tag.content}\n`;
					} else if (tag.charset) {
						metaTags += `charset: ${tag.charset}\n`;
					} else if (tag.property) {
						metaTags += `${tag.property}: ${tag.content}\n`;
					}
				});

				const formattedData = `Title: ${data.title}\nHost: ${data.host.domain}\nIP Address: ${data.host.ip_address}\nScheme: ${data.host.scheme}\n\nMeta Tags:\n${metaTags}\nStats:\nBytes: ${data.stats.bytes}\nFetch Duration: ${data.stats.fetch_duration}ms\nNumber of Scripts: ${data.stats.number_of_scripts}\nNumber of Stylesheets: ${data.stats.number_of_stylesheets}`;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: formattedData,
							color: null
						}]
					}
				});
			} catch (error) {
				console.log(error);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Failed to Meta Tags information.'
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
						embeds: [{
							description: resultdnslookup,
							color: null
						}]
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
						embeds: [{
							description: resultreversedns,
							color: null
						}]
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
						embeds: [{
							description: resultfindshareddns,
							color: null
						}]
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
						embeds: [{
							description: resulthostsearch,
							color: null
						}]
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
						embeds: [{
							description: resultreverseiplookup,
							color: null
						}]
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
						embeds: [{
							description: resultpagelinks,
							color: null
						}]
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
						embeds: [{
							description: resulthttpheaders,
							color: null
						}]
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

		if (interaction.data.name === 'quotes_daily') {
			try {
				const response = await axios.get('https://zenquotes.io/api/random');
				const quoteData = response.data[0];
				const {
					q: quote,
					a: character
				} = quoteData;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${quote}\n\n** ${character} **`,
							color: null
						}]
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

		if (interaction.data.name === 'quotes_daily2') {
			try {
				const response = await axios.get('https://api.quotable.io/quotes/random');
				const quoteData = response.data[0];
				const {
					content,
					author
				} = quoteData;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${content}\n\n**${author}**`,
							color: null
						}]
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

		if (interaction.data.name === 'quotes_stoic') {
			try {
				const response = await axios.get('https://api.themotivate365.com/stoic-quote');
				const {
					author,
					quote
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${quote}\n\n**${author}**`,
							color: null
						}]
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

		if (interaction.data.name === 'quotes_ron') {
			try {
				const response = await axios.get('http://ron-swanson-quotes.herokuapp.com/v2/quotes');
				const quote = response.data[0];

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${quote}\n\n**Ron Swanson**`,
							color: null
						}]
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

		if (interaction.data.name === 'quotes_kanye') {
			try {
				const response = await axios.get('https://api.kanye.rest');
				const {
					quote
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${quote}\n\n**Kanye West**`,
							color: null
						}]
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

		if (interaction.data.name === 'jokes_chuck') {
			try {
				const response = await axios.get('https://api.chucknorris.io/jokes/random');
				const {
					value
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${value}\n\n**Chuck Norris**`,
							color: null
						}]
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
				const {
					setup,
					punchline
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `**${setup}**\n\n${punchline}`,
							color: null
						}]
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

		if (interaction.data.name === 'jokes_evil') {
			try {
				const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
				const {
					insult
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${insult}`,
							color: null
						}]
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
				const {
					activity,
					type,
					participants
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `Activity: ${activity}\nType: ${type}\nParticipants: ${participants}`,
							color: null
						}]
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

		if (interaction.data.name === 'facts_cat') {
			try {
				const response = await axios.get('https://catfact.ninja/fact');
				const {
					fact
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${fact}`,
							color: null
						}]
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

		if (interaction.data.name === 'pics_cat') {
			try {
				const response = await axios.get('https://api.thecatapi.com/v1/images/search');
				const [{
					url
				}] = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							image: {
								url: url
							},
							color: null
						}]
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

		if (interaction.data.name === 'pics_dog') {
			try {
				const response = await axios.get('https://dog.ceo/api/breeds/image/random');
				const {
					message: imageUrl
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							image: {
								url: imageUrl
							},
							color: null
						}]
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

		if (interaction.data.name === 'pics_fox') {
			try {
				const response = await axios.get('https://randomfox.ca/floof/');
				const {
					image
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							image: {
								url: image
							},
							color: null
						}]
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

		if (interaction.data.name === 'pics_shiba') {
			try {
				const response = await axios.get('https://shibe.online/api/shibes');
				const [imageUrl] = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							image: {
								url: imageUrl
							},
							color: null
						}]
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

		if (interaction.data.name === 'pics_anime3') {
			const subcommand = interaction.data.options[0].name;
			try {
				let url;

				if (subcommand === 'waifu') {
					const response = await axios.get('https://api.waifu.pics/sfw/waifu');
					url = response.data.url;
				} else if (subcommand === 'neko') {
					const response = await axios.get('https://api.waifu.pics/sfw/neko');
					url = response.data.url;
				} else if (subcommand === 'waifu2') {
					const response = await axios.get('https://nekos.best/api/v2/waifu');
					url = response.data.results[0].url;
				} else if (subcommand === 'neko2') {
					const response = await axios.get('https://nekos.best/api/v2/neko');
					url = response.data.results[0].url;
				} else if (subcommand === 'kitsune') {
					const response = await axios.get('https://nekos.best/api/v2/kitsune');
					url = response.data.results[0].url;
				} else if (subcommand === 'husbando') {
					const response = await axios.get('https://nekos.best/api/v2/husbando');
					url = response.data.results[0].url;
				} else if (subcommand === 'waifu3') {
					const response = await axios.get('https://api.waifu.im/search/?included_tags=waifu');
					url = response.data.images[0].url;
				} else if (subcommand === 'maid') {
					const response = await axios.get('https://api.waifu.im/search/?included_tags=maid');
					url = response.data.images[0].url;
				}

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							image: {
								url: url,
							},
							color: null,
						}, ],
					},
				});
			} catch (error) {
				console.log(error);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Failed to fetch anime image.',
					},
				});
			}
		}


		if (interaction.data.name === 'pics_jkt48') {
			try {
				const response = await axios.get('https://jkt48-image.cyclic.app/api/jkt48');
				const {
					url
				} = response.data;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							image: {
								url: url
							},
							color: null
						}]
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

		if (interaction.data.name === 'randuser') {
			try {
				const response = await axios.get('https://random-data-api.com/api/users/random_user');
				const user = response.data;
				const {
					first_name,
					last_name,
					username,
					email,
					phone_number,
					social_insurance_number,
					date_of_birth,
					employment: {
						title,
						key_skill
					},
					address: {
						city,
						street_name,
						street_address,
						zip_code,
						state,
						country,
						coordinates
					}
				} = user;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							title: `${first_name} ${last_name}`,
							description: `Username: ${username}\nEmail: ${email}\nPhone Number: ${phone_number}\nSocial Insurance Number: ${social_insurance_number}\nDate of Birth: ${date_of_birth}`,
							fields: [{
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
						}]
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
				const {
					gender,
					name: {
						title,
						first,
						last
					},
					location: {
						street: {
							number,
							name
						},
						city,
						state,
						country,
						postcode,
						coordinates: {
							latitude,
							longitude
						},
						timezone: {
							offset,
							description
						}
					},
					email,
					dob: {
						date,
						age
					},
					registered: {
						date: registeredDate,
						age: registeredAge
					},
					phone,
					cell,
					id: {
						name: idName,
						value: idValue
					},
					picture: {
						large
					},
					nat
				} = user;


				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							title: `${title} ${first} ${last}`,
							description: `Gender: ${gender}\nEmail: ${email}\nDate of Birth: ${date}\nAge: ${age}\nRegistered Date: ${registeredDate}\nRegistered Age: ${registeredAge}`,
							fields: [{
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
						}]
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
				const {
					id,
					firstname,
					lastname,
					email,
					phone,
					birthday,
					gender,
					address: {
						street,
						streetName,
						buildingNumber,
						city,
						zipcode,
						country,
						county_code,
						latitude,
						longitude
					}
				} = user;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							title: `${firstname} ${lastname}`,
							description: `Gender: ${gender}\nEmail: ${email}\nBirthday: ${birthday}`,
							fields: [{
									name: 'Address',
									value: `Street: ${street} ${streetName} ${buildingNumber}\nCity: ${city}\nZipcode: ${zipcode}\nCountry: ${country}\nCounty Code: ${county_code}\nCoordinates: ${latitude}, ${longitude}`
								},
								{
									name: 'Contact',
									value: `Phone: ${phone}`
								}
							],
							color: null
						}]
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

		if (interaction.data.name === 'quotes_anime') {
			try {
				const response = await axios.get('https://animechan.vercel.app/api/random');
				const quoteData = response.data;
				const {
					anime,
					character,
					quote
				} = quoteData;

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						embeds: [{
							description: `${quote}\n\n** ${character} - ${anime} **`,
							color: null
						}]
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
	let slash_commands = [{
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
			"name": "iplookup",
			"description": "Fetches information about an IP address",
			"options": [{
				"name": "ip_address",
				"description": "IP address to fetch information",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "iplookup2",
			"description": "Fetches information about an IP address",
			"options": [{
				"name": "ip_address",
				"description": "IP address to fetch information",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "iplookup3",
			"description": "Fetches information about an IP address",
			"options": [{
				"name": "ip_address",
				"description": "IP address to fetch information",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "phonevalid",
			"description": "Validates a phone number and returns its details",
			"options": [{
				"name": "number",
				"description": "The phone number to validate. Example 6289123456789",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "phonevalid2",
			"description": "Validates a phone number and returns its details",
			"options": [{
				"name": "number",
				"description": "The phone number to validate. Example 6289123456789",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "phonevalid3",
			"description": "Validates a phone number and returns its details",
			"options": [{
				"name": "number",
				"description": "The phone number to validate. Example 6289123456789",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "emailvalid",
			"description": "Validate an email address and retrieve its details",
			"options": [{
				"name": "email",
				"description": "The email address to be validated",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "emailvalid2",
			"description": "Validate an email address and retrieve its details",
			"options": [{
				"name": "email",
				"description": "The email address to be validated",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "whoislookup",
			"description": "Performs a WHOIS lookup for a specified domain",
			"options": [{
				"name": "domain",
				"description": "The domain to perform the WHOIS lookup on",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "whoislookup2",
			"description": "Performs a WHOIS lookup for a specified domain",
			"options": [{
				"name": "domain",
				"description": "The domain to perform the WHOIS lookup on",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "shorten",
			"description": "Shorten a URL with domain shrtco.de, shiny.link, 9qr.de",
			"options": [{
				"name": "url",
				"description": "URL to shorten",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "shorten2",
			"description": "Shorten a URL with domain tinyurl.com",
			"options": [{
				"name": "url",
				"description": "URL to shorten",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "shorten3",
			"description": "Shorten a URL with domain is.gd",
			"options": [{
				"name": "url",
				"description": "URL to shorten",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "unshorten",
			"description": "Unshorten a URL",
			"options": [{
				"name": "url",
				"description": "URL to unshorten",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "metatagsviewer",
			"description": "Retrieve and view meta tags information from a specified URL",
			"options": [{
				"name": "url",
				"description": "The URL to fetch meta tags from",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "dnslookup",
			"description": "Performs a DNS lookup for a given domain and returns the corresponding IP address",
			"options": [{
				"name": "domain",
				"description": "The domain to perform the DNS lookup on",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "reversedns",
			"description": "Performs a reverse DNS lookup for a given IP address and returns the corresponding domain name",
			"options": [{
				"name": "ip_address",
				"description": "The IP address to perform the reverse DNS lookup on",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "findshareddns",
			"description": "Finds shared DNS servers between multiple domains using a specific nameserver",
			"options": [{
				"name": "nameserver",
				"description": "The nameserver to use for finding shared DNS servers",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "hostsearch",
			"description": "Finds DNS host records (subdomains) for a given domain",
			"options": [{
				"name": "domain",
				"description": "The domain for which to find DNS host records (subdomains)",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "reverseiplookup",
			"description": "Performs a reverse IP lookup to find the associated domain(s) for a given IP address",
			"options": [{
				"name": "ip_or_domain",
				"description": "The IP address or domain for which to perform the reverse IP lookup",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "pagelinks",
			"description": "Extracts links from a web page and returns a list of the extracted links",
			"options": [{
				"name": "url",
				"description": "The URL of the web page from which to extract links",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "httpheaders",
			"description": "Performs an HTTP header check on a given URL and returns the headers of the HTTP response",
			"options": [{
				"name": "url",
				"description": "The URL to perform the HTTP header check on",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "qrcode",
			"description": "Generates a QR code",
			"options": [{
				"name": "text",
				"description": "Text for the QR code",
				"type": 3,
				"required": true
			}]
		},
		{
			"name": "quotes_daily",
			"description": "Displays a random inspirational or motivational quote every day",
			"options": []
		},
		{
			"name": "quotes_daily2",
			"description": "Displays a random inspirational or motivational quote every day",
			"options": []
		},
		{
			"name": "quotes_stoic",
			"description": "Stoicism Quotes",
			"options": []
		},
		{
			"name": "quotes_ron",
			"description": "Ron Swanson Quotes",
			"options": []
		},
		{
			"name": "quotes_kanye",
			"description": "Kanye West Quotes",
			"options": []
		},
		{
			"name": "jokes_chuck",
			"description": "Chuck Norris Jokes",
			"options": []
		},
		{
			"name": "jokes",
			"description": "Random Jokes",
			"options": []
		},
		{
			"name": "jokes_evil",
			"description": "Random Evil Insult",
			"options": []
		},
		{
			"name": "activity",
			"description": "Random Activity Recommendations",
			"options": []
		},
		{
			"name": "facts_cat",
			"description": "Random Cat Facts",
			"options": []
		},
		{
			"name": "pics_cat",
			"description": "Random Pictures Of Cats",
			"options": []
		},
		{
			"name": "pics_dog",
			"description": "Random Pictures Of Dogs",
			"options": []
		},
		{
			"name": "pics_fox",
			"description": "Random Pictures Of Foxes",
			"options": []
		},
		{
			"name": "pics_shiba",
			"description": "Random Pictures Of Shiba Inu Dogs",
			"options": []
		},
		{
			"name": "pics_anime",
			"description": "Get random anime pictures",
			"options": [{
					"name": "waifu",
					"description": "Random Waifu Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "waifu2",
					"description": "Random Waifu Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "waifu3",
					"description": "Random Waifu Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "neko",
					"description": "Random Neko Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "neko2",
					"description": "Random Neko Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "maid",
					"description": "Random Maid Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "kitsune",
					"description": "Random Kitsune Anime Pictures",
					"type": 1,
					"options": []
				},
				{
					"name": "husbando",
					"description": "Random Husbando Anime Pictures",
					"type": 1,
					"options": []
				}
			]
		},
		{
			"name": "pics_jkt48",
			"description": "Random Pictures of JKT48 Members",
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
			"name": "quotes_anime",
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
