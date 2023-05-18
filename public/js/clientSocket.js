var connected = false; 

var socket = io("http://localhost:3003"); 
socket.emit("setup", userLoggedIn); 


socket.on("connected", () => connected = true); 
socket.on("message received", (newMessage) => {
   // console.log("client socket : ", newMessage);
   messageReceived(newMessage)
}); 

socket.on("notification received", () => {
   $.get("/api/notifications/latest", (notificationData) => {
      showNotificationPopup(notificationData); 
      refreshNotificationBadge(); 
   })
}) 

function emitNotification(userId){
   if(userId == userLoggedIn._id) return; 

   socket.emit("notification received", userId); 
}
