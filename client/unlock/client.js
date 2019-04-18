//send reset request to server
const handleReset = (e) => {
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


//React Component for login form
const ResetWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);


    return (
        <div>
        <form id="loginForm" name="loginForm"
            onSubmit={handleReset}
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
            onSubmit={handleLogin}
            action="/login"
            method="POST"
        >
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Forgot Password" />
        </form>
        </div>
    );
};


//call the react component for the login form
const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <ResetWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};


//set up initial navbar connections and show react component for login
const setup = (csrf) => {

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