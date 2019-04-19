"use strict";

//send reset request to server
var handleReset = function handleReset(e) {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //check all fields have values
    if ($("#pass2").val() == '' || $("#pass").val() == '') {
        handleError("Fill all fields!");
        return false;
    }
    if ($("#pass2").val() !== $("#pass").val()) {
        handleError("Passwords don't match!");
        return false;
    }

    //send request to server
    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

//React Component for login form
var ResetWindow = function ResetWindow(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            { id: "loginForm", name: "loginForm",
                onSubmit: handleReset,
                action: "/resetPage",
                method: "POST",
                className: "mainForm"
            },
            React.createElement(
                "label",
                { htmlFor: "username" },
                "Username: "
            ),
            React.createElement("input", { className: "formInput", id: "user", type: "text", name: "username", placeholder: "username" }),
            React.createElement(
                "label",
                { htmlFor: "pass" },
                "Password: "
            ),
            React.createElement("input", { className: "formInput", id: "pass", type: "password", name: "pass", placeholder: "password" }),
            React.createElement(
                "label",
                { htmlFor: "pass2" },
                "Password: "
            ),
            React.createElement("input", { className: "formInput", id: "pass2", type: "password", name: "pass2", placeholder: "confirm password" }),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { className: "formSubmit", type: "submit", value: "Reset Password" })
        )
    );
};

//call the react component for the login form
var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(ResetWindow, { csrf: csrf }), document.querySelector("#content"));
};

//set up initial navbar connections and show react component for login
var setup = function setup(csrf) {

    createLoginWindow(csrf); //default view
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        console.log('test');
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

//update and show error message
var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

//hide error message and redirect to given page
var redirect = function redirect(response) {
    $("#domoMessage").animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

//send request using Ajax
var sendAjax = function sendAjax(type, action, data, success, dataType) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: dataType ? dataType : "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};