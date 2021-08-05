const mongoose = require('mongoose');

const chat = mongoose.Schema({
    name : String,
    joinedAt : {
        type : Date,
        default : Date.now()
    },
    roomId : String
})

const Chat = mongoose.model('Chat',chat);
module.exports = Chat;