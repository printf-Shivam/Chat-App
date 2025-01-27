const path = require("path");
const http= require("http");
const express= require("express");
const socketio= require("socket.io");
const formatMessage= require("./utils/messages")
const {userJoin,getCurrentUser,userLeaves,getRoomUsers}= require("./utils/users")



const app = express();
const port=1000;


const server=http.createServer(app)
const io= socketio(server);

const botName="ChatBot";

//setting static folder
app.use(express.static(path.join(__dirname,"client")))

//when client connects
io.on("connection", socket=>{

    socket.on("joinRoom",({username, room})=>{

        const user=userJoin(socket.id, username, room)
        socket.join(user.room);

        //welcome current user
        socket.emit("message", formatMessage(botName,`${user.username} welcome to Room`))


        //brodcast when user connects
        socket.broadcast.
        to(user.room)
        .emit("message",formatMessage(botName, `${user.username} has joined the chat`))
    

        //send user and room info
        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    })

    //listen for chat message
    socket.on("chatMessage", msg=>{
        const user= getCurrentUser(socket.id);

        io.to(user.room).emit("message",formatMessage(user.username, msg))
    })


       //client disconnects
       socket.on("disconnect", ()=>{
        const user= userLeaves(socket.id);

        if(user){
        io.to(user.room).emit(
            "message",
            formatMessage(botName, `${user.username} has left the chat`))


         //send user and room info when someone leaves we update members list

            io.to(user.room).emit("roomUsers",{
                room:user.room,
                users:getRoomUsers(user.room)});
    }

    
    });
})



server.listen(port,()=>{
    console.log(`server running on port ${port}`)
})