

//event handler 
$("#searchBox").keydown(() =>{
    clearTimeout(timer); 
    var textbox = $(event.target); 
    var value = textbox.val(); 
    var searchType = textbox.data().search; 

    console.log("textbox", textbox)

    timer = setTimeout(() => {
      value = textbox.val().trim(); 

      if(value == ""){
         $(".resultsContainer").html(""); 
      } 
      else{
         
         search(value, searchType); 
      }
    }, 1000)
})


function search(searchTerm, searchType){
   var url = searchType == "users" ? "/api/users" : "api/posts" 
   //because the default is posts when this page is loaded and value can be simply passed htrough typing in the url 
   
   console.log(url); 

   $.get(url, {search: searchTerm}, (results) => {
      
      if(searchType == "users"){
         outputUsers(results, $(".resultsContainer")); 
      }
      else {
         outputPosts(results, $(".resultsContainer"))
      }
   })

}
