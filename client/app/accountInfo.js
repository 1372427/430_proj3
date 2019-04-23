//generic function to handle any account change. Takes in an event, and the name of the form
//posts the form information and then reloads account information page
const handleAccountChange = (e, formId) => {
    e.preventDefault();

    //if it is the email form, check email format
    if(formId==="emailForm"){    
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
    }
    //if it is the password form, check that values have been inputed
    else if(formId=="passForm" && $("#pass").val()==="")return handleError("Please put a new password!");

    //if everything is set, post information to server and reload page
    sendAjax('POST', $(`#${formId}`).attr("action"), $(`#${formId}`).serialize(), function() {
        loadAccountFromServer();
    });

    return false;
}

//load the mascot change page
const handleMakeMascotChange = (e) => {
    e.preventDefault();
    sendAjax('GET', '/mascots', null, (data) => {
        ReactDOM.render(
            <MascotList mascots={data.mascots} csrf={csrf}/>, document.querySelector("#app")
        );
    });

    return false;
}

//React component for the page displaying account information
const AccountInfo = function(props){
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //set active button in navbar
    document.querySelector('#accountButton').classList.add('active');
    document.querySelector('#homeButton').classList.remove('active');
    document.querySelector('#contestButton').classList.remove('active');

    let accountInfo = props.account;
    let ad;
    //If a basic account, write prompt to upgrade account
    if(accountInfo.type==="Basic"){
        ad = (<div id="upgrade">  
            <p>You currently have a Basic account. Upgrade to a Premium account for $5 and be able to host your own competitions!</p>
            
        <form id="upgradeForm"
            onSubmit = {(e) => handleAccountChange(e, 'upgradeForm')}
            name="upgradeForm"
            action="/upgrade"
            method="POST"
        >
        <input type="hidden" name="_csrf" value={csrf}/>
        <input className="upgradeSubmit" type="submit" value="Upgrade Account" />
        </form>
        </div>);
    }

    //display username, mascot, email, and account type
    //add two forms to change password or email 
    return (
        <div className="domoList">
            <div className="domo" id="account">
                <h3 >Username: {accountInfo.username}</h3>
                <h3 >Mascot: {accountInfo.mascot}
                <form id="mascotForm"
                    onSubmit = {(e) => handleMakeMascotChange(e)}
                    name="mascotForm"
                >
                <input type="hidden" name="_csrf" value={csrf}/>
                <input className="makeDomoSubmit" type="submit" value="Change Mascot" />
                </form>
                </h3>
                <h3 >Email: {accountInfo.email}</h3>
                <h3>Account Type: {accountInfo.type}</h3>
                <form id="passForm"
                    onSubmit = {(e) => handleAccountChange(e, 'passForm')}
                    name="passForm"
                    action="/pass"
                    method="POST"
                    className="domoForm"
                >
                <label htmlFor="pass">Password: </label>
                <input  className="formInput2" id="pass" type="password" name="pass" placeholder="new password"/>
                <input type="hidden" name="_csrf" value={csrf}/>
                <input className="makeDomoSubmit" type="submit" value="Change Password" />
                </form>
                <form id="emailForm"
                    onSubmit = {(e) => handleAccountChange(e, 'emailForm')}
                    name="emailForm"
                    action="/email"
                    method="POST"
                    className="domoForm"
                >
                <label htmlFor="email">Email: </label>
                <input  className="formInput2" id="email" type="text" name="email" placeholder="new email"/>
                <input type="hidden" name="_csrf" value={csrf}/>
                <input className="makeDomoSubmit" type="submit" value="Change Email" />
                </form>
             </div>
             {ad}
        </div>
    );
};

//get account information from the server and load React Component
const loadAccountFromServer = (csrf) => {
    sendAjax('GET', '/accountInfo', null, (data) => {
        ReactDOM.render(
            <AccountInfo account={data.account} csrf={csrf}/>, document.querySelector("#app")
        );
    });
};