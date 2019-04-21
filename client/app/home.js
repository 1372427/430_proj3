let csrf;

//call the function to create the React Component to 
//enter the given contest
const handleEnterContest = (id) => {
    createEntryWindow(csrf, id);
}

const handleSort = (e) => {
    loadCompetitionsFromServer(document.querySelector('#sort').value)
}

//React Component to show current contests
const ContestList = function(props){
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //set active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.add('active');
    document.querySelector('#contestButton').classList.remove('active');
    
    //if no contests, display message
    if(props.contests.length === 0){
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Contests yet</h3>
            </div>
        );
    }
    
    //for each contest, show its name, description, reward, and deadline
    const contestNodes = props.contests.map(function(contest){
        return(
            <div id={contest._id} key={contest._id} className="domo" onClick={(e) =>handleEnterContest(contest)}>
                <img src={`/assets/img/mascots/${contest.mascot}`} alt="cat" className="domoFace"/>
                
                <div className="domoContent">
                <h3 >Name: {contest.name}</h3>
                <h3 >Description: {contest.description}</h3>
                <h3 >Reward: ${contest.reward}</h3>
                <h3 >Deadline: {contest.deadline.substring(0,10)}</h3>
                <h3>Tags: {contest.tags.join(", ")}</h3>
                </div>
            </div>
        );
    });

    let addTag = (e) => {
        let selected = props.selectedTags;
        selected.push(e.target.id)
        ReactDOM.render( <ContestList contests={props.contests} type={props.type} tags={props.tags} selectedTags={selected}/>, document.querySelector("#app"))
    }

    let tagNodes = props.tags.map((tag) => (<option id={tag} onClick={addTag}>{tag}</option>))
    
    //show all contests in list
    return (
        <div className="domoList">
        <h3>Filters: {props.selectedTags}</h3>
        <select>
            {tagNodes}
        </select>

        <h3>Sort: </h3>
        <select id="sort" onChange={handleSort}>
            <option value='"deadline"_-1'>Oldest</option>
            <option value='"deadline"_1'>Newest</option>
            <option value='"reward"_-1'>Least Reward</option>
            <option value='"reward"_1'>Most Reward</option>
            <option value='"name"_1'>A-Z</option>
            <option value='"name"_-1'>Z-A</option>
        </select>
            {contestNodes}
        </div>
    );
};


//query the server to get the account type and current contests
const loadCompetitionsFromServer = (sort) => {
    sendAjax('GET', '/accountInfo', null, (data) => {
        let type = data.account.type;
        sendAjax('GET', `/getContests?sort=${sort}`, null, (data) => {
            let contests = data.contests
            sendAjax('GET', '/tags', null, (data) => {

                ReactDOM.render(
                    <ContestList contests={contests} type={type} tags={data.tags} selectedTags={[]}/>, document.querySelector("#app")
                );
            })
        });
    });
};

//function to set up app after login
const setup = function(csrf){
    //initialize React Component showing all current contests to show none
    ReactDOM.render(
        <ContestList contests={[]} />, document.querySelector("#app")
    );
    
    //set up navigation buttons
    const accountButton = document.querySelector("#accountButton");
    const homeButton = document.querySelector("#homeButton");
    const contestButton = document.querySelector("#contestButton");

    accountButton.addEventListener("click", (e) => {
        e.preventDefault();
        loadAccountFromServer(csrf);
        return false;
    });

    homeButton.addEventListener("click", (e) => {
        e.preventDefault();
        loadCompetitionsFromServer('"deadline"_1');
        return false;
    });

    contestButton.addEventListener("click", (e) => {
        e.preventDefault();
        createCompetitionWindow(csrf);
        return false;
    });

    //query server to update contest list
    loadCompetitionsFromServer('"deadline"_1');
};

//get csrf token then set  up page
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        csrf = result.csrfToken;
        setup(result.csrfToken);
    });
};

//call getToken when the page has loaded
$(document).ready(function(){
    getToken();
});