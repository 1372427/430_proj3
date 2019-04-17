
//get form information and send to server to create an entry
const handleEntry = (e) => {
    e.preventDefault();
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //check that all fields are filled
    if($("#name").val() === '' || $("#content").val() === '' ){
        handleError("All fields are required");
        return false;
    }

    //all is good, send request to server
    sendAjax('POST', $("#entryForm").attr("action"), $("#entryForm").serialize(), redirect);

    return false;
};

//React Component to create entry
const EntryWindow = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);
    
    //set active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.add('active');
    document.querySelector('#contestButton').classList.remove('active');

    let csrf = props.csrf;
    let contest = props.contest;

    //return form with input for name and entry content
    return (
        <form id="entryForm"
            name="entryForm"
            onSubmit={handleEntry}
            action="/makeEntry"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="name">Name: </label>
            <input  className="formInput" id="name" type="text" name="name" placeholder="name"/>
            <label htmlFor="content">Content: </label>
            <input  className="formInput" id="content" type="text" name="content" placeholder="entry"/>
            <input type="hidden" name="_csrf" value={csrf}/>
            <input type="hidden" name="contest" value={contest}/>
            <input className="formSubmit" type="submit" value="Submit"/>
        </form>
    );
};

//React Component for listing all entries 
const EntryList = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);
    
    //set active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.add('active');
    document.querySelector('#contestButton').classList.remove('active');

    //If no entries, write a message
    if(props.entries.length === 0){
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Entries yet</h3>
            </div>
        );
    }
    
    //for each entry, show the mascot, name, and content
    let contestId = props.contest
    const contestNodes = props.entries.map(function(entry){
        return(
            <div id={entry._id} key={entry._id} className="domo" onClick={ (e) => handleWinnerClick(entry._id, contestId)}>
                <img src={`/assets/img/mascots/${entry.mascot}`} alt="cat" className="domoFace"/>
                <div className="domoContent">
                <h3 >Name: {entry.name}</h3> 
                <h3 >Content: {entry.content}</h3>
                </div>
            </div>
        );
    });

    //display list of entries
    return (
        <div className="domoList">
            {contestNodes}
        </div>
    );
};

//call the React Component to make a new entry
const createEntryWindow = (csrf, contest) => {
    ReactDOM.render(
        <EntryWindow csrf={csrf} contest={contest}/>,
        document.querySelector("#app")
    );
}; 