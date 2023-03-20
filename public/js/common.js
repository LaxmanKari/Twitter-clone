$("#postTextarea").keyup(event =>{
    var textbox = $(event.target); 
    var value = textbox.val().trim(); 

    var submitButton = $("#submitPostButton"); 

    if(submitButton.length == 0){ //if there is button in a page, length would be more than 0
       return alert("No Submit button found");
    }

    if(value == ""){
      submitButton.prop("disabled", true); 
      return;
    } 

    submitButton.prop("disabled", false);

    //console.log(value); 
})

$("#submitPostButton").click((event) =>{
  var button = $(event.target);
  var textbox = $("#postTextarea"); // jQuery object with id postTextarea 

  var data = {
     content: textbox.val() 
  } 
   
  //ajax request, send data to this "/api/posts" endpoint
  $.post("/api/posts", data, (postData, status, xhr) =>{
     //this arrow func is a callback function, excecuted when the above ajax request is done 
     //xhr (xml-http-request) contains status of the request, if succeded = 200 or else 400 (failed) 
     //console.log(postData);

     var html = createPostHtml(postData); 
     $(".postsContainer").prepend(html); 
     textbox.val(""); 
     button.prop("disabled", true); 

  })
})

function createPostHtml(postData) {

   var postedBy = postData.postedBy; 

   if(postedBy._id === undefined){
      return console.log("User object not populated"); 
   }
   var displayName = postedBy.firstName + " " + postedBy.lastName; 
   var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

   return `<div class='post'> 
                <div class='mainContentContainer'> 
                   <div class='userImageContainer'> 
                       <img src='${postedBy.profilePic}'> 
                   </div> 
                   <div class="postContentContainer"> 
                      <div class="header"> 
                        <a href='/profile/${postedBy.userName}' class="displayName"> ${displayName} </a> 
                        <span class='username'> @${postedBy.userName} </span> 
                        <span class='date'> ${timestamp} </span>
                      </div> 
                      <div class="postBody"> 
                         <span>${postData.content} </span>
                      </div>
                      <div class="postFooter"> 
                         <div class="postButtonContainer">
                            <button> 
                            <i class="fa-solid fa-comment"></i> 
                            </button>
                         </div>
                         <div class="postButtonContainer">
                            <button> 
                            <i class="fa-solid fa-retweet"></i> 
                            </button>
                         </div>
                         <div class="postButtonContainer">
                            <button> 
                            <i class="fa-solid fa-heart"></i>
                            </button>
                         </div>
                      </div>
                   </div> 
                </div> 
   
   
          </div>`; 
}


function timeDifference(current, previous) {

   var msPerMinute = 60 * 1000;
   var msPerHour = msPerMinute * 60;
   var msPerDay = msPerHour * 24;
   var msPerMonth = msPerDay * 30;
   var msPerYear = msPerDay * 365;

   var elapsed = current - previous;

   if (elapsed < msPerMinute) {
       if(elapsed/1000 < 30) return "Just now";
       
       return Math.round(elapsed/1000) + ' seconds ago';   
   }

   else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + ' minutes ago';   
   }

   else if (elapsed < msPerDay ) {
        return Math.round(elapsed/msPerHour ) + ' hours ago';   
   }

   else if (elapsed < msPerMonth) {
       return Math.round(elapsed/msPerDay) + ' days ago';   
   }

   else if (elapsed < msPerYear) {
       return Math.round(elapsed/msPerMonth) + ' months ago';   
   }

   else {
       return Math.round(elapsed/msPerYear ) + ' years ago';   
   }
}


