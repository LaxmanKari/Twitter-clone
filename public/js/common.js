$("#postTextarea, #replyTextarea").keyup(event =>{
    var textbox = $(event.target); 
    var value = textbox.val().trim(); 

    var isModal = textbox.parents(".modal").length == 1;  

    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton"); 

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

$("#submitPostButton, #submitReplyButton").click((event) =>{
  var button = $(event.target);

  var isModal = button.parents(".modal").length == 1;
  var textbox = isModal ? $('#replyTextarea') : $("#postTextarea"); 

  var data = {
     content: textbox.val() 
  } 

  if(isModal){
   var id = button.data().id;
   if(id == null){return alert("Button id is null");} 
   data.replyTo = id; 

  }
   
  //ajax request, send data to this "/api/posts" endpoint
  $.post("/api/posts", data, (postData, status, xhr) =>{
     //this arrow func is a callback function, excecuted when the above ajax request is done 
     //xhr (xml-http-request) contains status of the request, if succeded = 200 or else 400 (failed) 
     //console.log(postData);

     if(postData.replyTo){
      location.reload();
     }
     else{
      var html = createPostHtml(postData); 
      $(".postsContainer").prepend(html); 
      textbox.val(""); 
      button.prop("disabled", true); 
     }

  })
})

//fires when a modal is trigerd 
$("#replyModal").on("shown.bs.modal", (event) => {
   var button = $(event.relatedTarget);
   var postId = getPostIdfromElement(button);
   $('#submitReplyButton').data("id", postId); // this data attribute is stored for this element in jquery cache,  
   //will not be shown in element tree

   $.get("/api/posts/" + postId, results =>{
      outputPosts(results.postData, $("#originalPostContainer"));
     //console.log("printing when modal is trigered",results); 
   })
})

//trigers when modal is closed, we done this because it displays the prev opened post for few secs, due to latency 
$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))


$("#deletePostModal").on("shown.bs.modal", (event) => {

   
   var button = $(event.relatedTarget);
   var postId = getPostIdfromElement(button);
   $('#deletePostButton').data("id", postId); // this data attribute is stored for this element in jquery cache,  
   //will not be shown in element tree

   console.log($('#deletePostButton').data().id);
})

    

$('#deletePostButton').click((event) => {
     var postId =$(event.target).data("id"); //element's data id 

     $.ajax({
      url: `/api/posts/${postId}`,
      type: "DELETE",
      // callback returns some data, we can then use status code 
      success: (postData) => {
         //  if(xhr != 202){
         //    alert("could not delete the post"); 
         //  }
          location.reload(); //reload the page
      }
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

$(document).on("click", ".followButton", (event) =>{
   var button = $(event.target);
   var userId = button.data().user;  
   
   $.ajax({
      url: `/api/users/${userId}/follow`,
      type: "PUT",
      success: (data, status, xhr) => {

         if(xhr.status == 404){
             alert("user not found"); 
             return;
         }

         var difference = 1; 

         if(data.following && data.following.includes(userId)) {
            button.addClass("following"); 
            button.text("Following"); 
         } 
         else {
            button.removeClass("following");
            button.text("Follow"); 
            difference = -1; 
         }

         var followersLabel = $("#followersValue"); 
         if(followersLabel !=0){
            var followersText = followersLabel.text(); 
            followersText = parseInt(followersText); 
            followersLabel.text(followersText + difference); 
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

$(document).on("click", ".post", (event) =>{
   var element = $(event.target);
   var postId = getPostIdfromElement(element); 

   if(postId !== undefined && !element.is("button")){
      window.location.href = '/posts/' + postId; 
   }
})

$(document).on("click", ".followButton", (event) =>{
   var button = $(event.target);
   var userId = button.data().user; 
   console.log(userId); 
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
 

function createPostHtml(postData, largeFont = false) {

   if(postData == null) return alert("post object is null"); 

   var isRetweet = postData.retweetData !== undefined; 
   var retweetedBy = isRetweet ? postData.postedBy.userName : null; 
   postData = isRetweet ? postData.retweetData : postData; 

   // console.log(isRetweet); 
   // console.log(postData); 
   
   var postedBy = postData.postedBy; 

   if(postedBy._id === undefined){
      return console.log("User object not populated"); 
   }
   var displayName = postedBy.firstName + " " + postedBy.lastName; 
   var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

   var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""; 
   var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
   var largeFontClass = largeFont ? "largeFont" : ""; 

   var retweetText = ''; 
   if(isRetweet){
      retweetText = `<span>
                         <i class="fa-solid fa-retweet"></i>
                         Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                    </span>`
   }

   var replyFlag = ""; 
   if(postData.replyTo && postData.replyTo._id){

      if(!postData.replyTo._id){
         return alert("Reply to is not populated"); 
      }
      else if(!postData.replyTo.postedBy._id){
         return alert("Posted by is not populated"); 
      }

      var replyToUsername = postData.replyTo.postedBy.userName; 
      replyFlag = `<div class='replyFlag'>
                       Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername} </a>
                  </div>`;
   }

   var buttons = ""; 
   if(postData.postedBy._id == userLoggedIn._id){
      buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"> <i class="fa-sharp fa-solid fa-xmark"></i>
                 </button> `
   }
   
   return `<div class='post ${largeFontClass}' data-id="${postData._id}"> 
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
                        ${buttons}
                      </div> 
                      ${replyFlag}
                      <div class="postBody"> 
                         <span>${postData.content} </span>
                      </div>
                      <div class="postFooter"> 
                      <div class='postButtonContainer'>
                          <button data-toggle='modal' data-target='#replyModal'>
                              <i class='far fa-comment'></i>
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


// moved from home.js to common as we use this both in home and reply modal 
function outputPosts(results, container) {
   container.html(""); 
   
   //because when displaying post in reply modal, the results is not an array, therefore converting
   if(!Array.isArray(results)){
      results = [results]; 
   }

   results.forEach(result => {
     var html = createPostHtml(result)
     container.append(html); 
   }); 

   if(results.length == 0) {
     container.append("<span class='noResults'> Nothing to show. </span>")
   }
}

function outputPostsWithReplies(results, container) {
   container.html(""); 

   if(results.replyTo !== undefined && results.replyTo._id !==undefined ){
        var html = createPostHtml(results.replyTo); 
        container.append(html); 
   }

   var mainPostHtml = createPostHtml(results.postData, true); 
   container.append(mainPostHtml);
   
   results.replies.forEach(result => {
     var html = createPostHtml(result)
     container.append(html); 
   }); 

}

