import { config } from 'dotenv';
config();

import Bot, { saveTwitchOAuthCode } from './module.js';
Bot({
    mongodb: {
        protocol: process.env.MONGODB_PROTOCOL,
        username: process.env.MONGODB_USERNAME,
        password: process.env.MONGODB_PASSWORD,
        host: process.env.MONGODB_HOST,
        database: process.env.MONGODB_DATABASE
    },
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        scopes: process.env.TWITCH_CLIENT_SCOPES,
        redirectUri: process.env.TWITCH_CLIENT_REDIRECT_URI
    },
    token: process.env.DISCORD_TOKEN,
    registerCommands: process.env.DISCORD_REGISTER_COMMANDS === 'true',
    timeZone: process.env.DEFAULT_TIMEZONE
});

import { createServer } from 'http';
if (process.env.PORT) {
    createServer(async (req, res) => {
        if (await saveTwitchOAuthCode(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, process.env.TWITCH_CLIENT_REDIRECT_URI, `http://${req.headers.host}${req.url}`)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<p>You can now close this window.</p><script>setTimeout(() => window.close(), 2000);</script>');
        } else {
            res.writeHead(404);
            res.end();
        }
    }).listen(process.env.PORT, () => console.log(`Twitch Schedule in Discord is running on port ${process.env.PORT}.`));
}
