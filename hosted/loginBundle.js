"use strict";

//send login request to server
var handleLogin = function handleLogin(e) {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //check all fields have values
    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Fill all fields!");
        return false;
    }

    //send request to server
    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

//send sign up request to server
var handleSignup = function handleSignup(e) {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //check all fields are filled
    if ($("#user").val() === '' || $("#pass").val() === '' || $("#pass2").val() === '' || $("#email").val() === '') {
        handleError("All fields are required");
        return false;
    }

    //check the two passwords match
    if ($("#pass").val() !== $("#pass2").val()) {
        handleError("Passwords do not match");
        return false;
    }

    //check that the email is in proper format
    var emailCheck1 = $("#email").val().split('@');

    if (emailCheck1.length !== 2 || emailCheck1[0].length < 1 || emailCheck1[1].length < 1) {
        handleError("Invalid email");
        return false;
    }
    var emailCheck2 = emailCheck1[1].split('.');
    if (emailCheck2.length < 2 || emailCheck2[0].length < 1 || emailCheck2[1].length < 1) {
        handleError("Invalid email");
        return false;
    }

    //all is good, send request to server
    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

    return false;
};

var handleForgotPass = function handleForgotPass(e) {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //all is good, send request to server
    sendAjax('GET', $("#forgotPassForm").attr("action") + "?" + $("#forgotPassForm").serialize(), null, redirect);
};

//React Component for login form
var LoginWindow = function LoginWindow(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    document.querySelector('#loginButton').classList.add('active');
    document.querySelector('#signupButton').classList.remove('active');

    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            { id: "loginForm", name: "loginForm",
                onSubmit: handleLogin,
                action: "/login",
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
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign in" })
        ),
        React.createElement(
            "form",
            { id: "forgotPassForm", name: "forgotPassForm",
                onSubmit: handleForgotPass,
                action: "/resetPass",
                method: "POST"
            },
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { className: "formSubmit", type: "submit", value: "Forgot Password" })
        )
    );
};

//React Component for sign up form
var SignupWindow = function SignupWindow(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);
    document.querySelector('#loginButton').classList.remove('active');
    document.querySelector('#signupButton').classList.add('active');

    return React.createElement(
        "form",
        { id: "signupForm",
            name: "signupForm",
            onSubmit: handleSignup,
            action: "/signup",
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
            { htmlFor: "email" },
            "Email: "
        ),
        React.createElement("input", { className: "formInput", id: "email", type: "text", name: "email", placeholder: "email" }),
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
        React.createElement("input", { className: "formInput", id: "pass2", type: "password", name: "pass2", placeholder: "retype password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign Up" })
    );
};

//call the react component for the login form
var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

//call the react component for the sign up form
var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};

//set up initial navbar connections and show react component for login
var setup = function setup(csrf) {
    //set up nav bar
    var loginButton = document.querySelector("#loginButton");
    var signupButton = document.querySelector("#signupButton");

    //set up listeners
    signupButton.addEventListener("click", function (e) {
        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

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