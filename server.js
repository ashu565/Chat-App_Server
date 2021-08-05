const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const mongoose = require('mongoose')
const app = express();
const cors = require('cors')
const dotenv = require('dotenv');
const Chat = require('./chatSchema');

dotenv.config({
    path : './config.env'
})

const DB = process.env.DATABASE_URL.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB connection Success!");
}).catch(() => {
    console.log('Error');
})

const server = http.Server(app);
app.use(cors());
const io = socketIo(server, {
    cors : {
        origin : [process.env.CLIENT],
        methods : ['GET','POST','DELETE']
    }
});

io.on('connection',socket => {
    let curr_room_id;
    let curr_name;
    socket.on('create',(room,name) => {
        socket.join(room);
        curr_room_id = room;
        curr_name = name;
        Chat.create({
            name,
            roomId : room
        })
        socket.to(room).emit('user-joined',name);
    })
    socket.on('toServer',(message,room,name) => {
        socket.to(room).emit('toClient',message,name);
    })
    socket.on('join-room',(name,room) => {
        socket.to(room).emit('user-joined',name);
    })
    socket.on('user-left-server',(room ,name)=> {
        socket.to(room).emit('user-left-client',name);
    })
    socket.on('disconnect',() => {
        socket.to(curr_room_id).emit('user-left-client',curr_name);
    })
})
const PORT = process.env.PORT || 3000
server.listen(PORT,() => {
    console.log(`Server running on Port ${PORT}`)
})