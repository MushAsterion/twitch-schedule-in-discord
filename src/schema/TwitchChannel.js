import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    guildId: {
        type: mongoose.SchemaTypes.String,
        required: true
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
        required: true
    },
    refresh_token: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

const TwitchChannel = mongoose.model('TwitchChannel', schema);
export default TwitchChannel;
