import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    guildId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        index: true
    },
    timeZone: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    changeChannel: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    changeLanguage: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    twitchId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        index: true
    },
    refresh_token: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

// Add compound index for guildId + twitchId for common queries
schema.index({ guildId: 1, twitchId: 1 });

const TwitchChannel = mongoose.model('TwitchChannel', schema);
export default TwitchChannel;
