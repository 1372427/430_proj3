//send request to create a new competition to the server
const handleCompetition = (e) => {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //check that all fields are filled
    if($("#name").val() == '' || $("#descrip").val() == ''){
        handleError("Fill all fields please!");
        return false;
    }

    //try to create date, send error message if in wrong format
    let deadline = $("#deadline").val();
    deadline = deadline.split('/');
    deadline = new Date(deadline[2], deadline[0], deadline[1]);
    if(isNaN(deadline)){
        
        handleError("Use date format YYYY/MM/DD!");
        return false;
    }
    
    //all is good, send the request to the server and load redirected page
    sendAjax('POST', $("#competitionForm").attr("action"), $("#competitionForm").serialize(), redirect);

    return false;
};

//get entries from a contest from the server and create React Coponent
const handlePickWinner = (id) => {
    sendAjax('GET', `/entries?contest=${id}`, null, (data) => {
        ReactDOM.render(
            <EntryList entries={data.entries} contest={id}/>, document.querySelector("#app")
        );
    });
}

//Send selected winner to the server and display confirmation page
const handleWinnerClick = (entryId, contestId) => {
    sendAjax('POST', '/setWinner', `entry=${entryId}&contest=${contestId}&_csrf=${csrf}`, (data) => {
        let username = data.winner.username;
        let email = data.winner.email;
        ReactDOM.render(
            <div className="domoList">
                <h3 className="emptyDomo">Thank you for picking a winner.</h3>
                <h3 className="emptyDomo">You selected {username} as your winner.</h3>
                <h3 className="emptyDomo">An email has been sent to {username}.</h3>
                <h3 className="emptyDomo">Contact them further at {email}</h3>
            </div>, document.querySelector("#app")
        );
    });
}

//React Component to display all of user's contests and allow them to create more
const CompetitionWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);
    
    //select active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.remove('active');
    document.querySelector('#contestButton').classList.add('active');

    //Check if a basic account
    if(props.type==="Basic"){
        return (
            <div className="domoList">
                <h3 className="emptyDomo">You currently have a Basic account.</h3>
                <h3 className="emptyDomo"> Please upgrade to Premium to create contests.</h3>
            </div>
        )
    }

    //run through all contests and set up information
    const contestNodes = props.contests.map(function(contest){
        return(
            <div id={contest._id} key={contest._id} className="domoOwn" onClick={(e) =>contest.winner?handleError("Already Won!"):handlePickWinner(contest._id)}>
                <img src={`/assets/img/mascots/${contest.mascot}`} alt="cat" className="domoFace"/>
                
                <div className="domoContent">
                <h3 >Name: {contest.name}</h3>
                <h3 >Description: {contest.description}</h3>
                <h3 >Reward: ${contest.reward}</h3>
                <h3 >Deadline: {contest.deadline.substring(0,10)}</h3>
                <h3 >Entries: {contest.entries}</h3>
                <h3>Winner: {contest.winner? "A Winner has already been selected!": "No Winner selected!"}</h3>
                </div>
            </div>
        );
    });

    //display all contests and create a button to create new contests
    return (
        <div className="domoList">
        
        <div style={{width: "97%", height: "50px"}}>
                <button className="formSubmit" onClick={() => sendAjax('GET','/tags', null, (d) => ReactDOM.render(<MakeCompetitionWindow csrf={csrf} allTags={d.tags} tags={[]}/>, document.querySelector('#app')))
        }>New Contest</button>
            </div>
            {contestNodes}

        </div>
    );
};

//React Component to make new contests
const MakeCompetitionWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //select active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.remove('active');
    document.querySelector('#contestButton').classList.add('active');

    //get current date
    let dateObj = new Date(Date.now());
    let date = dateObj.getDate();
    let month = dateObj.getMonth();
    let year = dateObj.getFullYear();
    let csrf = props.csrf;
    let allTags = props.allTags;
    let tags = props.tags;

    let addTag = (e) => {
        if(tags.includes(e.target.id))return;
        tags.push(e.target.id)
        document.getElementById("myDropdown").classList.toggle("show");
        ReactDOM.render(<MakeCompetitionWindow csrf={csrf} allTags={allTags} tags={tags}/>, document.querySelector("#app"))
    }

    let tagNodes = props.allTags.map((tag) => (<span id={tag} onClick={addTag}>{tag}</span>))
    
    //https://www.w3schools.com/howto/howto_js_dropdown.asp
    let dropdownClick = (e) => {
        document.getElementById("myDropdown").classList.toggle("show");
        e.preventDefault();
        return false;
    }

    let  filterFunction =(e) =>{
        let input, filter, div, a, i, count=0;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        div = document.getElementById("myDropdown");
        a = div.getElementsByTagName("span");
        for (i = 0; i < a.length; i++) {
          let txtValue = a[i].textContent || a[i].innerText;
          if (count<=5 && txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
            count++;
          } else {
            a[i].style.display = "none";
          }
        }
      }
    //create form, with inputs for name, description, reward, and deadline
    return (
        <form id="competitionForm" name="competitionForm"
            onSubmit={handleCompetition}
            action="/makeContest"
            method="POST"
            className="mainForm"
        >
        <label htmlFor="name">Contest Name: </label>
        <input  className="formInput" id="name" type="text" name="name" placeholder="name"/>
        <label htmlFor="descrip">Description: </label>
        <input  className="formInput" id="descrip" type="text" name="descrip" placeholder="description"/>
        <label htmlFor="reward">Reward: $</label>
        <input  className="formInput" id="reward" type="text" name="reward" placeholder="10.00"/>
        <label htmlFor="deadline">Deadline: </label>
        <input  className="formInput" id="deadline" type="text" name="deadline" placeholder={`${year}/${month}/${date}`}/>
        <label htmlFor="tags" id="tagsLabel">Tags: </label>
        <textarea  className="formInput" id="tags" type="text" name="tags" placeholder="Poetry" value={props.tags}/>
        <div className="dropdown">
            <button onClick={dropdownClick} className="dropbtn">Add Tag</button>
            <div id="myDropdown" className="dropdown-content">
                <input type="text" placeholder="Search.." id="myInput" onKeyUp={filterFunction}/>
                {tagNodes}
            </div>
        </div>
        <input type="hidden" name="_csrf" value={csrf}/>
        <input className="formSubmit" type="submit" value="Submit" />
        </form>
    );
}

//get the contests for this user and create the React Component
const createCompetitionWindow = (csrf) => {
    //get info about this user
    sendAjax('GET', '/accountInfo', null, (data) => {
        //check account type
        let type = data.account.type;
        //if a Premium user, query server for all contests made by this user
        if(type==="Premium"){
            sendAjax('GET', `/getContests?owner=${data.account.id}`, null, (data) => {
                let contests = data.contests;
                ReactDOM.render(
                    <CompetitionWindow csrf={csrf} type={type} contests={contests}/>,
                    document.querySelector("#app")
                );})
        }
        //is a basic user, send without any contests
        ReactDOM.render(
            <CompetitionWindow csrf={csrf} type={type} contests={[]}/>,
            document.querySelector("#app")
        );
    });
};