//update and show error message
const handleError = (message) => {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({width: 'toggle'}, 350);
};

//hide error message and redirect to given page
const redirect = (response) => {
    $("#domoMessage").animate({width: 'hide'}, 350);
    window.location = response.redirect;
};

//send request using Ajax
const sendAjax = (type, action, data, success, dataType) => {
    $.ajax({
        cache: false, 
        type: type,
        url: action,
        data: data,
        dataType: (dataType? dataType : "json"),
        success: success,
        error: function(xhr, status, error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};