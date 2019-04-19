//send reset request to server
const handleReset = (e) => {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //check all fields have values
    if($("#pass2").val() == '' || $("#pass").val() == ''){
        handleError("Fill all fields!");
        return false;
    }
    if($("#pass2").val() !== $("#pass").val()){
        handleError("Passwords don't match!");
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
            action="/resetPage"
            method="POST"
            className="mainForm"
        >
        <label htmlFor="username">Username: </label>
        <input className="formInput" id="user" type="text" name="username" placeholder="username"/>
        <label htmlFor="pass">Password: </label>
        <input  className="formInput" id="pass" type="password" name="pass" placeholder="password"/>
        <label htmlFor="pass2">Password: </label>
        <input  className="formInput" id="pass2" type="password" name="pass2" placeholder="confirm password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Reset Password" />
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