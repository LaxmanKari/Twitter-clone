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

    console.log(value); 
})