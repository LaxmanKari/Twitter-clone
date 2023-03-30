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

// dynamic content (not available when page loads, this button is only available after making call to the api)
$(document).on("click", ".likeButton", (event) =>{
   var button = $(event.target);
   //goes into the root of the DOM to get id
   var postId = getPostIdfromElement(button); 
   
   if(postId === undefined) return; 

   $.ajax({
      url: `/api/posts/${postId}/like`,
      type: "PUT",
      success: (postData) => {
          

         button.find("span").text(postData.likes.length || ""); 

         if(postData.likes.includes(userLoggedIn._id)) {
            button.addClass("active"); 
         } 
         else {
            button.removeClass("active");
         }
      }
   })
})

$(document).on("click", ".retweetButton", (event) =>{
   var button = $(event.target);
   //goes into the root of the DOM to get id
   var postId = getPostIdfromElement(button); 
   
   if(postId === undefined) return; 

   $.ajax({
      url: `/api/posts/${postId}/retweet`,
      type: "POST",
      success: (postData) => {
         
          
         button.find("span").text(postData.retweetUsers.length || ""); 

         if(postData.retweetUsers.includes(userLoggedIn._id)) {
            button.addClass("active"); 
         } 
         else {
            button.removeClass("active");
         }
      }
   })
})

function getPostIdfromElement(element) {

   var isRoot = element.hasClass("post"); 
   var rootElement = isRoot ? element : element.closest(".post"); 
   var postId = rootElement.data().id; 

   if(postId === undefined){
      return alert("Post id undefined"); 
   }

   return postId; 
}
 

function createPostHtml(postData) {

   if(postData == null) return alert("post object is null"); 

   var isRetweet = postData.retweetData !== undefined; 
   var retweetedBy = isRetweet ? postData.postedBy.userName : null; 
   postData = isRetweet ? postData.retweetData : postData; 

   console.log(isRetweet); 

   var postedBy = postData.postedBy; 

   if(postedBy._id === undefined){
      return console.log("User object not populated"); 
   }
   var displayName = postedBy.firstName + " " + postedBy.lastName; 
   var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

   var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""; 
   var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";

   var retweetText = ''; 
   if(isRetweet){
      retweetText = `<span>
                         <i class="fa-solid fa-retweet"></i>
                         Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                    </span>`
   }
   
   return `<div class='post' data-id="${postData._id}"> 
               <div class='postActionContainer'> 
                    
                     ${retweetText}
               </div> 
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
                         <div class="postButtonContainer green">
                            <button class="retweetButton ${retweetButtonActiveClass}"> 
                            <i class="fa-solid fa-retweet"></i>
                            <span> ${postData.retweetUsers.length || ""} </span>
                             
                            </button>
                         </div>
                         <div class="postButtonContainer red">
                            <button class="likeButton ${likeButtonActiveClass}"> 
                            <span> ${postData.likes.length || ""} </span>
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


