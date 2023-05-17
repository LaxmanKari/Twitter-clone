$(document).ready(() => {
  $.get("/api/notifications", (data) => {
    outputNotificationList(data, $(".resultsContainer"));
  });
});

$("#markNotificationsAsRead").click(() => {
  markNotificationsAsOpened(); 
})

function outputNotificationList(notifications, container) {
  notifications.forEach((notification) => {
    var html = createNotificationHtml(notification);
    container.append(html);
  });

  if (notifications.length == 0) {
    container.append("<span class='noResults'> Nothing to show </span>");
  }
}

function createNotificationHtml(notification) {
  var userFrom = notification.userFrom;
  var text = getNotificationText(notification); 
  var href = getNotificationUrl(notification); 
  var className = notification.opened ? "" : "active"; 

  return `<a href='${href}' class='resultsListItem notification ${className}' data-id ='${notification._id}'> 
               <div class='resultsImageContainer'> 
                  <img src='${userFrom.profilePic}'> 
               </div> 
               <div class='resultsDetailsContainer ellipsis'> 
                  <span class='ellipsis notification ${className} data-id ='${notification._id}' > ${text} </span>
               </div> 
   
          </a>`;
}

function getNotificationText(notification){

    var userFrom = notification.userFrom; 


    if(!userFrom.firstName || !userFrom.lastName){
        return alert("User from data not populated");
    } 

    var userFromName = `${userFrom.firstName} ${userFrom.lastName}`; 

    var text; 

    if(notification.notificationType == "retweet"){
        text = `${userFromName} retweeted one of your posts`; 
    }
    else if(notification.notificationType == "postLike"){
        text = `${userFromName} liked one of your posts`; 
    }
    else if(notification.notificationType == "reply"){
      text = `${userFromName} replied to one of your posts`; 
    }
    else if(notification.notificationType == "follow"){
      text = `${userFromName} Followed you`; 
    }

    // return `<span class='ellipsis'${text}</span>`;
    return text; 
}


function getNotificationUrl(notification){

  var url = "#"; 

  if(notification.notificationType == "retweet" || 
     notification.notificationType == "postLike" || 
     notification.notificationType == "reply") {

    url = `/posts/${notification.entityId}`; 
  }
  
  else if(notification.notificationType == "follow"){
      url = `/profile/${notification.entityId}`; 
  }
 
  return url; 
}