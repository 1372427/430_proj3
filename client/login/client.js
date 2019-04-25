//send login request to server
const handleLogin = (e) => {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //check all fields have values
    if($("#user").val() == '' || $("#pass").val() == ''){
        handleError("Fill all fields!");
        return false;
    }
    
    //send request to server
    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

    return false;
};

//send sign up request to server
const handleSignup = (e) => {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //check all fields are filled
    if($("#user").val() === '' || $("#pass").val() === '' || $("#pass2").val() === '' || $("#email").val() === ''){
        handleError("All fields are required");
        return false;
    }

    //check the two passwords match
    if( $("#pass").val() !==  $("#pass2").val()){
        handleError("Passwords do not match");
        return false;
    }

    //check that the email is in proper format
    const emailCheck1 = $("#email").val().split('@');

    if( emailCheck1.length !== 2 || emailCheck1[0].length<1 || emailCheck1[1].length<1){
        handleError("Invalid email");
        return false;
    }
    const emailCheck2 = emailCheck1[1].split('.');
    if(emailCheck2.length< 2 || emailCheck2[0].length<1 || emailCheck2[1].length<1 ){
        handleError("Invalid email");
        return false;
    }
    
    //all is good, send request to server
    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

    return false;
};

//when user clicks the forgot password button, send them to reset window page.
const handleForgotPass = (e, csrf) => {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    ReactDOM.render(<ResetWindow csrf={csrf}/>, document.querySelector("#content"));
    return false;
}

//check that username and email have been entered, then send reset request to server
const handleReset = (e) => {
    e.preventDefault();
    //check all fields have values
    if($("#user").val() === '' ||  $("#email").val() === ''){
        handleError("All fields are required");
        return false;
    }
    //all is good, send request to server
    sendAjax('POST', $("#resetForm").attr("action"), $("#resetForm").serialize(), redirect);

    return false;
}

//React Component for login form
const LoginWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    document.querySelector('#loginButton').classList.add('active');
    document.querySelector('#signupButton').classList.remove('active');

    return (
        <div>
        <form id="loginForm" name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
        <label htmlFor="username">Username: </label>
        <input className="formInput" id="user" type="text" name="username" placeholder="username"/>
        <label htmlFor="pass">Password: </label>
        <input  className="formInput" id="pass" type="password" name="pass" placeholder="password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Sign in" />
        </form>
        <form id="forgotPassForm" name="forgotPassForm"
            onSubmit={(e) => handleForgotPass(e, props.csrf)}
            action="/resetPass"
            method="POST"
        >
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Forgot Password" />
        </form>
        </div>
    );
};

//React Component for sign up form
const SignupWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);
    document.querySelector('#loginButton').classList.remove('active');
    document.querySelector('#signupButton').classList.add('active');

    return (
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input  className="formInput" id="user" type="text" name="username" placeholder="username"/>
            <label htmlFor="email">Email: </label>
            <input  className="formInput" id="email" type="text" name="email" placeholder="email"/>
            <label htmlFor="pass">Password: </label>
            <input  className="formInput" id="pass" type="password" name="pass" placeholder="password"/>
            <label htmlFor="pass2">Password: </label>
            <input  className="formInput" id="pass2" type="password" name="pass2" placeholder="retype password"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="formSubmit" type="submit" value="Sign Up"/>
        </form>
    );
};

//Reach Component for requesting a password reset
const ResetWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    return (
        <form id="resetForm"
            name="resetForm"
            onSubmit={handleReset}
            action="/reset"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input  className="formInput" id="user" type="text" name="username" placeholder="username"/>
            <label htmlFor="email">Email: </label>
            <input  className="formInput" id="email" type="text" name="email" placeholder="email"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="formSubmit" type="submit" value="Reset"/>
        </form>
    );
}

//call the react component for the login form
const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

//call the react component for the sign up form
const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

//set up initial navbar connections and show react component for login
const setup = (csrf) => {
    //set up nav bar
    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");

    //set up listeners
    signupButton.addEventListener("click", (e) => {
        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createLoginWindow(csrf);//default view
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        console.log('test');
        setup(result.csrfToken);
    });
};

$(document).ready(function(){
    getToken();
});