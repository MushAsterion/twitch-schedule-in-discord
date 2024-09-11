# Twitch Schedule in Discord

Take your Twitch channel management to the next level with the powerful `/calendar` slash command! Seamlessly create, edit, and delete scheduled streams right from your Discord server.

When you connect your Twitch channel to your server, you unlock the ability for your team to update the channel schedule with ease. **Anyone with command access can jump in and make changes**, making it a game-changer for collaborative setups like Web TVs.

**By default, only admins can access these commands**—but you can easily expand access by tweaking your server settings.

The first time you use the commands, you’ll be prompted to link your Twitch account and grant permission to manage the schedule. Once that’s done, anyone in your server with command access can update your schedule—even if they don’t have direct permissions on Twitch. It’s a streamlined, efficient way to keep your content organized and your team in sync.

# Installation

## Hosted version

A hosted version of the bot is already available and can be directly invited into your server, [invite it](https://discord.com/oauth2/authorize?client_id=1271947996267024456&integration_type=0&scope=applications.commands) or [visit its directory page](https://discord.com/application-directory/1271947996267024456)!

## Host it yourself

If you however still want to have your very own version, you can use this repository.

There are two ways to use this repository:

### As a standalone

You can deploy the server as a standalone, then you will have to provide the `env` file with the following:

```SHELL
DISCORD_TOKEN=""
DISCORD_REGISTER_COMMANDS="true"

TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
TWITCH_CLIENT_SCOPES="channel:manage:schedule"
TWITCH_CLIENT_REDIRECT_URI=""

MONGODB_PROTOCOL=""
MONGODB_USERNAME=""
MONGODB_PASSWORD=""
MONGODB_HOST=""
MONGODB_DATABASE=""

PORT=2050
DEFAULT_TIMEZONE="Europe/Dublin"
```

It will requires you to [create a Twitch Application](https://dev.twitch.tv/docs/authentication/register-app/), [create a Discord application](https://discord.com/developers/docs/quick-start/getting-started#step-1-creating-an-app) and have a [MongoDB](https://mongodb.com/) server available.

If you provide a `PORT`, the server will listen to that port for incomming requests and if a request matches with the URL provided in `TWITCH_CLIENT_REDIRECT_URI` then it will complete the OAuth2 grant flow, otherwise it will send a 404 (Not Found) response.

### As a module

If you wish to use the bot as part of an existing application, you can import is as a module into your existing application

```SHELL
npm i MushAsterion/twitch-schedule-in-discord
```

And use it as follows:

```JS
// Initialization
import Bot from 'twitch-schedule-in-discord/module.js';
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
    registerCommands: process.env.DISCORD_REGISTERCOMMANDS === 'true'
});

// Add OAuth validation
import { createServer } from 'http';
import { saveTwitchOAuthCode } from 'twitch-schedule-in-discord/module.js';
createServer(async (req, res) => {
    // This functions once resolved returns a boolean on whether the URL matches redirect URI and
    // if it was correctly saved. It will not save any content not linked to the target URL.
    if (await saveTwitchOAuthCode(
        process.env.TWITCH_CLIENT_ID,
        process.env.TWITCH_CLIENT_SECRET,
        process.env.TWITCH_CLIENT_REDIRECT_URI,
        `http://${req.headers.host}${req.url}`
    )) {
        // Response if matches
    } else {
        // Remaining logic of your server.
    }
}).listen(process.env.PORT);
```

A complete example of this behavior can be found within the [`index.js`](index.js) file, as the [standalone method](#as-a-standalone) uses it directly.

# Contributing

This project is provided as-is. However if you want to contribute to [add more languages](#adding-languages) or features feel free to do so. You can [create pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) to do so.

## Adding languages

You can add more languages or fix current translations by editing the relevant language of the text strings within the `localizations` variable of [`/src/localization.js`](src/localization.js). Please refer to [Discord's list of locales](https://discord.com/developers/docs/reference#locales) for correct key name of your desired language.

# License

MIT ([see full details](LICENSE))
