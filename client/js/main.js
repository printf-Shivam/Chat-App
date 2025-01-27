const chatForm= document.getElementById("chat-form");
const chatmessages= document.querySelector(".chat-messages")
const roomName= document.getElementById("room-name")
const userlist= document.getElementById("users")


//get username and room from url
const {username, room }= Qs.parse(location.search,{
    ignoreQueryPrefix:true
});


const socket = io();


// join chatroom
socket.emit("joinRoom", {username, room});


//get room users
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
})


//message from server
socket.on("message", message=>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatmessages.scrollTop=chatmessages.scrollHeight;
})

//message submit
chatForm.addEventListener("submit", e=>{
    e.preventDefault();

    //get message text
    const msg= e.target.elements.msg.value;
    //emit message to server
    socket.emit("chatMessage", msg);

    //clear the input field
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
})

//ouput message to DOM
function outputMessage(message){
    const div= document.createElement("div");
    div.classList.add("message");
    div.innerHTML=`<p class="meta">${message.username}    <span>${message.time}</span> </p>
						<p class="text">
							${message.text}
						</p>`;
    document.querySelector(".chat-messages").appendChild(div);

}


//add roomname to dom
function outputRoomName(room){
roomName.innerText=room;
}

// add users to dom
function outputUsers(users){
    userlist.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}`
}