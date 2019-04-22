"use strict";

//generic function to handle any account change. Takes in an event, and the name of the form
//posts the form information and then reloads account information page
var handleAccountChange = function handleAccountChange(e, formId) {
    e.preventDefault();

    //if it is the email form, check email format
    if (formId === "emailForm") {
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
    }
    //if it is the password form, check that values have been inputed
    else if (formId == "passForm" && $("#pass").val() === "") return handleError("Please put a new password!");

    //if everything is set, post information to server and reload page
    sendAjax('POST', $("#" + formId).attr("action"), $("#" + formId).serialize(), function () {
        loadAccountFromServer();
    });

    return false;
};

//load the mascot change page
var handleMakeMascotChange = function handleMakeMascotChange(e) {
    e.preventDefault();
    sendAjax('GET', '/mascots', null, function (data) {
        ReactDOM.render(React.createElement(MascotList, { mascots: data.mascots, csrf: csrf }), document.querySelector("#app"));
    });

    return false;
};

//React component for the page displaying account information
var AccountInfo = function AccountInfo(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //set active button in navbar
    document.querySelector('#accountButton').classList.add('active');
    document.querySelector('#homeButton').classList.remove('active');
    document.querySelector('#contestButton').classList.remove('active');

    var accountInfo = props.account;
    var ad = void 0;
    //If a basic account, write prompt to upgrade account
    if (accountInfo.type === "Basic") {
        ad = React.createElement(
            "div",
            { id: "upgrade" },
            React.createElement(
                "p",
                null,
                "You currently have a Basic account. Upgrade to a Premium account for $5 and be able to host your own competitions!"
            ),
            React.createElement(
                "form",
                { id: "upgradeForm",
                    onSubmit: function onSubmit(e) {
                        return handleAccountChange(e, 'upgradeForm');
                    },
                    name: "upgradeForm",
                    action: "/upgrade",
                    method: "POST"
                },
                React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                React.createElement("input", { className: "upgradeSubmit", type: "submit", value: "Upgrade Account" })
            )
        );
    }

    //display username, mascot, email, and account type
    //add two forms to change password or email 
    return React.createElement(
        "div",
        { className: "domoList" },
        React.createElement(
            "div",
            { className: "domo" },
            React.createElement(
                "h3",
                null,
                "Username: ",
                accountInfo.username
            ),
            React.createElement(
                "h3",
                null,
                "Mascot: ",
                accountInfo.mascot,
                React.createElement(
                    "form",
                    { id: "mascotForm",
                        onSubmit: function onSubmit(e) {
                            return handleMakeMascotChange(e);
                        },
                        name: "mascotForm"
                    },
                    React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                    React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Change Mascot" })
                )
            ),
            React.createElement(
                "h3",
                null,
                "Email: ",
                accountInfo.email
            ),
            React.createElement(
                "h3",
                null,
                "Account Type: ",
                accountInfo.type
            ),
            React.createElement(
                "form",
                { id: "passForm",
                    onSubmit: function onSubmit(e) {
                        return handleAccountChange(e, 'passForm');
                    },
                    name: "passForm",
                    action: "/pass",
                    method: "POST",
                    className: "domoForm"
                },
                React.createElement(
                    "label",
                    { htmlFor: "pass" },
                    "Password: "
                ),
                React.createElement("input", { className: "formInput2", id: "pass", type: "password", name: "pass", placeholder: "new password" }),
                React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Change Password" })
            ),
            React.createElement(
                "form",
                { id: "emailForm",
                    onSubmit: function onSubmit(e) {
                        return handleAccountChange(e, 'emailForm');
                    },
                    name: "emailForm",
                    action: "/email",
                    method: "POST",
                    className: "domoForm"
                },
                React.createElement(
                    "label",
                    { htmlFor: "email" },
                    "Email: "
                ),
                React.createElement("input", { className: "formInput2", id: "email", type: "text", name: "email", placeholder: "new email" }),
                React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Change Email" })
            )
        ),
        ad
    );
};

//get account information from the server and load React Component
var loadAccountFromServer = function loadAccountFromServer(csrf) {
    sendAjax('GET', '/accountInfo', null, function (data) {
        ReactDOM.render(React.createElement(AccountInfo, { account: data.account, csrf: csrf }), document.querySelector("#app"));
    });
};
"use strict";

//send request to create a new competition to the server
var handleCompetition = function handleCompetition(e) {
    e.preventDefault();

    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //check that all fields are filled
    if ($("#name").val() == '' || $("#descrip").val() == '') {
        handleError("Fill all fields please!");
        return false;
    }

    //try to create date, send error message if in wrong format
    var deadline = $("#deadline").val();
    deadline = deadline.split('/');
    deadline = new Date(deadline[2], deadline[0], deadline[1]);
    if (isNaN(deadline)) {

        handleError("Use date format YYYY/MM/DD!");
        return false;
    }

    //all is good, send the request to the server and load redirected page
    sendAjax('POST', $("#competitionForm").attr("action"), $("#competitionForm").serialize(), redirect);

    return false;
};

//get entries from a contest from the server and create React Coponent
var handlePickWinner = function handlePickWinner(id) {
    sendAjax('GET', "/entries?contest=" + id, null, function (data) {
        ReactDOM.render(React.createElement(EntryList, { entries: data.entries, contest: id }), document.querySelector("#app"));
    });
};

//Send selected winner to the server and display confirmation page
var handleWinnerClick = function handleWinnerClick(entryId, contestId) {
    sendAjax('POST', '/setWinner', "entry=" + entryId + "&contest=" + contestId + "&_csrf=" + csrf, function (data) {
        var username = data.winner.username;
        var email = data.winner.email;
        ReactDOM.render(React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "Thank you for picking a winner."
            ),
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "You selected ",
                username,
                " as your winner."
            ),
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "An email has been sent to ",
                username,
                "."
            ),
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "Contact them further at ",
                email
            )
        ), document.querySelector("#app"));
    });
};

//React Component to display all of user's contests and allow them to create more
var CompetitionWindow = function CompetitionWindow(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //select active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.remove('active');
    document.querySelector('#contestButton').classList.add('active');

    //Check if a basic account
    if (props.type === "Basic") {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "You currently have a Basic account."
            ),
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                " Please upgrade to Premium to create contests."
            )
        );
    }

    //run through all contests and set up information
    var contestNodes = props.contests.map(function (contest) {
        return React.createElement(
            "div",
            { id: contest._id, key: contest._id, className: "domo", onClick: function onClick(e) {
                    return contest.winner ? handleError("Already Won!") : handlePickWinner(contest._id);
                } },
            React.createElement("img", { src: "/assets/img/mascots/" + contest.mascot, alt: "cat", className: "domoFace" }),
            React.createElement(
                "div",
                { className: "domoContent" },
                React.createElement(
                    "h3",
                    null,
                    "Name: ",
                    contest.name
                ),
                React.createElement(
                    "h3",
                    null,
                    "Description: ",
                    contest.description
                ),
                React.createElement(
                    "h3",
                    null,
                    "Reward: $",
                    contest.reward
                ),
                React.createElement(
                    "h3",
                    null,
                    "Deadline: ",
                    contest.deadline.substring(0, 10)
                ),
                React.createElement(
                    "h3",
                    null,
                    "Entries: ",
                    contest.entries
                ),
                React.createElement(
                    "h3",
                    null,
                    "Winner: ",
                    contest.winner ? "A Winner has already been selected!" : "No Winner selected!"
                )
            )
        );
    });

    //display all contests and create a button to create new contests
    return React.createElement(
        "div",
        { className: "domoList" },
        contestNodes,
        React.createElement(
            "button",
            { className: "formSubmit", onClick: function onClick() {
                    return sendAjax('GET', '/tags', null, function (d) {
                        return ReactDOM.render(React.createElement(MakeCompetitionWindow, { csrf: csrf, allTags: d.tags, tags: [] }), document.querySelector('#app'));
                    });
                } },
            "New Contest"
        )
    );
};

//React Component to make new contests
var MakeCompetitionWindow = function MakeCompetitionWindow(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //select active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.remove('active');
    document.querySelector('#contestButton').classList.add('active');

    //get current date
    var dateObj = new Date(Date.now());
    var date = dateObj.getDate();
    var month = dateObj.getMonth();
    var year = dateObj.getFullYear();
    var csrf = props.csrf;
    var allTags = props.allTags;
    var tags = props.tags;

    var addTag = function addTag(e) {
        tags.push(e.target.id);
        ReactDOM.render(React.createElement(MakeCompetitionWindow, { csrf: csrf, allTags: allTags, tags: tags }), document.querySelector("#app"));
    };

    var tagNodes = props.allTags.map(function (tag) {
        return React.createElement(
            "span",
            { id: tag, onClick: addTag },
            tag
        );
    });

    //https://www.w3schools.com/howto/howto_js_dropdown.asp
    var dropdownClick = function dropdownClick(e) {
        document.getElementById("myDropdown").classList.toggle("show");
        e.preventDefault();
        return false;
    };

    var filterFunction = function filterFunction(e) {
        var input, filter, div, a, i;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        div = document.getElementById("myDropdown");
        a = div.getElementsByTagName("span");
        for (i = 0; i < a.length; i++) {
            var txtValue = a[i].textContent || a[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    };
    //create form, with inputs for name, description, reward, and deadline
    return React.createElement(
        "form",
        { id: "competitionForm", name: "competitionForm",
            onSubmit: handleCompetition,
            action: "/makeContest",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "name" },
            "Contest Name: "
        ),
        React.createElement("input", { className: "formInput", id: "name", type: "text", name: "name", placeholder: "name" }),
        React.createElement(
            "label",
            { htmlFor: "descrip" },
            "Description: "
        ),
        React.createElement("input", { className: "formInput", id: "descrip", type: "text", name: "descrip", placeholder: "description" }),
        React.createElement(
            "label",
            { htmlFor: "reward" },
            "Reward: $"
        ),
        React.createElement("input", { className: "formInput", id: "reward", type: "text", name: "reward", placeholder: "10.00" }),
        React.createElement(
            "label",
            { htmlFor: "deadline" },
            "Deadline: "
        ),
        React.createElement("input", { className: "formInput", id: "deadline", type: "text", name: "deadline", placeholder: year + "/" + month + "/" + date }),
        React.createElement(
            "label",
            { htmlFor: "tags" },
            "Tags: "
        ),
        React.createElement("input", { className: "formInput", id: "tags", type: "text", name: "tags", placeholder: "Poetry", value: props.tags }),
        React.createElement(
            "div",
            { "class": "dropdown" },
            React.createElement(
                "button",
                { onClick: dropdownClick, className: "dropbtn" },
                "Add Tag"
            ),
            React.createElement(
                "div",
                { id: "myDropdown", className: "dropdown-content" },
                React.createElement("input", { type: "text", placeholder: "Search..", id: "myInput", onKeyUp: filterFunction }),
                tagNodes
            )
        ),
        React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
    );
};

//get the contests for this user and create the React Component
var createCompetitionWindow = function createCompetitionWindow(csrf) {
    //get info about this user
    sendAjax('GET', '/accountInfo', null, function (data) {
        //check account type
        var type = data.account.type;
        //if a Premium user, query server for all contests made by this user
        if (type === "Premium") {
            sendAjax('GET', "/getContests?owner=" + data.account.id, null, function (data) {
                var contests = data.contests;
                ReactDOM.render(React.createElement(CompetitionWindow, { csrf: csrf, type: type, contests: contests }), document.querySelector("#app"));
            });
        }
        //is a basic user, send without any contests
        ReactDOM.render(React.createElement(CompetitionWindow, { csrf: csrf, type: type, contests: [] }), document.querySelector("#app"));
    });
};
"use strict";

//get form information and send to server to create an entry
var handleEntry = function handleEntry(e) {
    e.preventDefault();
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //check that all fields are filled
    if ($("#name").val() === '' || $("#content").val() === '') {
        handleError("All fields are required");
        return false;
    }

    //all is good, send request to server
    sendAjax('POST', $("#entryForm").attr("action"), $("#entryForm").serialize(), redirect);

    return false;
};

//React Component to create entry
var EntryWindow = function EntryWindow(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //set active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.add('active');
    document.querySelector('#contestButton').classList.remove('active');

    var csrf = props.csrf;
    var contest = props.contest;
    console.log(contest);
    //return form with input for name and entry content
    return React.createElement(
        "div",
        null,
        React.createElement(
            "h1",
            null,
            "Contest Name: ",
            contest.name
        ),
        React.createElement(
            "h1",
            null,
            "Description: ",
            contest.description
        ),
        React.createElement(
            "form",
            { id: "entryForm",
                name: "entryForm",
                onSubmit: handleEntry,
                action: "/makeEntry",
                method: "POST",
                className: "mainForm"
            },
            React.createElement(
                "label",
                { htmlFor: "name" },
                "Name: "
            ),
            React.createElement("input", { className: "formInput", id: "name", type: "text", name: "name", placeholder: "name" }),
            React.createElement(
                "label",
                { htmlFor: "content" },
                "Content: "
            ),
            React.createElement("input", { className: "formInput", id: "content", type: "text", name: "content", placeholder: "entry" }),
            React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
            React.createElement("input", { type: "hidden", name: "contest", value: contest._id }),
            React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
        )
    );
};

//React Component for listing all entries 
var EntryList = function EntryList(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //set active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.add('active');
    document.querySelector('#contestButton').classList.remove('active');

    //If no entries, write a message
    if (props.entries.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Entries yet"
            )
        );
    }

    //for each entry, show the mascot, name, and content
    var contestId = props.contest;
    var contestNodes = props.entries.map(function (entry) {
        return React.createElement(
            "div",
            { id: entry._id, key: entry._id, className: "domo", onClick: function onClick(e) {
                    return handleWinnerClick(entry._id, contestId);
                } },
            React.createElement("img", { src: "/assets/img/mascots/" + entry.mascot, alt: "cat", className: "domoFace" }),
            React.createElement(
                "div",
                { className: "domoContent" },
                React.createElement(
                    "h3",
                    null,
                    "Name: ",
                    entry.name
                ),
                React.createElement(
                    "h3",
                    null,
                    "Content: ",
                    entry.content
                )
            )
        );
    });

    //display list of entries
    return React.createElement(
        "div",
        { className: "domoList" },
        contestNodes
    );
};

//call the React Component to make a new entry
var createEntryWindow = function createEntryWindow(csrf, contest) {
    ReactDOM.render(React.createElement(EntryWindow, { csrf: csrf, contest: contest }), document.querySelector("#app"));
};
'use strict';

var csrf = void 0;

//call the function to create the React Component to 
//enter the given contest
var handleEnterContest = function handleEnterContest(id) {
    createEntryWindow(csrf, id);
};

var handleSort = function handleSort(e) {
    loadCompetitionsFromServer(document.querySelector('#sort').value);
};

//React Component to show current contests
var ContestList = function ContestList(props) {
    console.log(props);
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //set active nav bar
    document.querySelector('#accountButton').classList.remove('active');
    document.querySelector('#homeButton').classList.add('active');
    document.querySelector('#contestButton').classList.remove('active');

    //if no contests, display message
    if (props.contests.length === 0) {
        return React.createElement(
            'div',
            { className: 'domoList' },
            React.createElement(
                'h3',
                { className: 'emptyDomo' },
                'No Contests yet'
            )
        );
    }
    var selectedTags = props.selectedTags;

    //for each contest, show its name, description, reward, and deadline
    var contestNodes = props.contests.map(function (contest) {
        for (var i = 0; i < selectedTags.length; i++) {
            console.log(contest.tags);
            console.log(contest.tags.includes(selectedTags[i]));
            if (!contest.tags.includes(selectedTags[i])) return;
        }
        return React.createElement(
            'div',
            { id: contest._id, key: contest._id, className: 'domo', onClick: function onClick(e) {
                    return handleEnterContest(contest);
                } },
            React.createElement('img', { src: '/assets/img/mascots/' + contest.mascot, alt: 'cat', className: 'domoFace' }),
            React.createElement(
                'div',
                { className: 'domoContent' },
                React.createElement(
                    'h3',
                    null,
                    'Name: ',
                    contest.name
                ),
                React.createElement(
                    'h3',
                    null,
                    'Description: ',
                    contest.description
                ),
                React.createElement(
                    'h3',
                    null,
                    'Reward: $',
                    contest.reward
                ),
                React.createElement(
                    'h3',
                    null,
                    'Deadline: ',
                    contest.deadline.substring(0, 10)
                ),
                React.createElement(
                    'h3',
                    null,
                    'Tags: ',
                    contest.tags.map(function (e) {
                        return React.createElement(
                            'button',
                            { onClick: function onClick(evt) {
                                    evt.stopPropagation();addTag(evt, false);
                                } },
                            e
                        );
                    })
                )
            )
        );
    });

    var addTag = function addTag(e, fromSelect) {
        var newTag = document.querySelector('#filter').value;
        if (!fromSelect) newTag = e.target.innerHTML;
        var selected = props.selectedTags;
        if (selected.includes(newTag)) return;
        selected.push(newTag);
        ReactDOM.render(React.createElement(ContestList, { contests: props.contests, type: props.type, tags: props.tags, selectedTags: selected }), document.querySelector("#app"));
    };
    var removeTag = function removeTag(e) {
        console.log(e.target);
        var selected = props.selectedTags;
        selected = selected.filter(function (value) {
            return value !== e.target.id;
        });
        ReactDOM.render(React.createElement(ContestList, { contests: props.contests, type: props.type, tags: props.tags, selectedTags: selected }), document.querySelector("#app"));
    };

    var tagNodes = props.tags.map(function (tag) {
        return React.createElement(
            'option',
            { id: tag },
            tag
        );
    });
    var selectedNodes = props.selectedTags.map(function (tag) {
        return React.createElement(
            'button',
            { id: tag, onClick: removeTag },
            tag
        );
    });

    //show all contests in list
    return React.createElement(
        'div',
        { className: 'domoList' },
        React.createElement(
            'h3',
            null,
            'Filters: ',
            props.selectedTags.join(", ")
        ),
        selectedNodes,
        React.createElement(
            'select',
            { id: 'filter', onChange: function onChange(e) {
                    return addTag(e, true);
                } },
            React.createElement(
                'option',
                { disabled: true, selected: true },
                'Please Select'
            ),
            tagNodes
        ),
        React.createElement(
            'h3',
            null,
            'Sort: '
        ),
        React.createElement(
            'select',
            { id: 'sort', onChange: handleSort },
            React.createElement(
                'option',
                { value: '"deadline"_1' },
                'Oldest'
            ),
            React.createElement(
                'option',
                { value: '"deadline"_-1' },
                'Newest'
            ),
            React.createElement(
                'option',
                { value: '"reward"_-1' },
                'Most Reward'
            ),
            React.createElement(
                'option',
                { value: '"reward"_1' },
                'Least Reward'
            ),
            React.createElement(
                'option',
                { value: '"name"_1' },
                'A-Z'
            ),
            React.createElement(
                'option',
                { value: '"name"_-1' },
                'Z-A'
            )
        ),
        contestNodes
    );
};

//query the server to get the account type and current contests
var loadCompetitionsFromServer = function loadCompetitionsFromServer(sort) {
    sendAjax('GET', '/accountInfo', null, function (data) {
        var type = data.account.type;
        sendAjax('GET', '/getContests?sort=' + sort, null, function (data) {
            var contests = data.contests;
            sendAjax('GET', '/tags', null, function (data) {

                ReactDOM.render(React.createElement(ContestList, { contests: contests, type: type, tags: data.tags, selectedTags: [] }), document.querySelector("#app"));
            });
        });
    });
};

//function to set up app after login
var setup = function setup(csrf) {
    //initialize React Component showing all current contests to show none
    ReactDOM.render(React.createElement(ContestList, { contests: [] }), document.querySelector("#app"));

    //set up navigation buttons
    var accountButton = document.querySelector("#accountButton");
    var homeButton = document.querySelector("#homeButton");
    var contestButton = document.querySelector("#contestButton");

    accountButton.addEventListener("click", function (e) {
        e.preventDefault();
        loadAccountFromServer(csrf);
        return false;
    });

    homeButton.addEventListener("click", function (e) {
        e.preventDefault();
        loadCompetitionsFromServer('"deadline"_1');
        return false;
    });

    contestButton.addEventListener("click", function (e) {
        e.preventDefault();
        createCompetitionWindow(csrf);
        return false;
    });

    //query server to update contest list
    loadCompetitionsFromServer('"deadline"_1');
};

//get csrf token then set  up page
var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        csrf = result.csrfToken;
        setup(result.csrfToken);
    });
};

//call getToken when the page has loaded
$(document).ready(function () {
    getToken();
});
"use strict";

//React Component to show all mascots
var MascotList = function MascotList(props) {
    //hide error message
    $("#domoMessage").animate({ width: 'hide' }, 350);

    //for each mascot, show their image and name
    var mascotNodes = Object.keys(props.mascots).map(function (mascot) {
        return React.createElement(
            "div",
            { id: mascot, className: "domo", onClick: function onClick(e) {
                    return handleMascotClick(e, mascot);
                } },
            React.createElement("img", { src: "/assets/img/mascots/" + props.mascots[mascot], alt: "mascot", className: "domoFace" }),
            React.createElement(
                "div",
                { className: "domoContent" },
                React.createElement(
                    "h3",
                    null,
                    "Name: ",
                    mascot
                )
            )
        );
    });

    //show all mascots in list
    return React.createElement(
        "div",
        { className: "domoList" },
        mascotNodes
    );
};

//send selected mascot to server then reload the page to activate mascot
var handleMascotClick = function handleMascotClick(e, mascot) {
    sendAjax('POST', '/mascots', "mascot=" + mascot + "&_csrf=" + csrf, function () {
        location.reload();
    });
};
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