"use strict";

var handleUpgrade = function handleUpgrade(e) {
    e.preventDefault();

    sendAjax('POST', $("#upgradeForm").attr("action"), $("#upgradeForm").serialize(), function () {
        loadAccountFromServer();
    });
    return false;
};
var handleUsernameChange = function handleUsernameChange(e) {
    e.preventDefault();
    console.log($("#uesrnameForm"));
    sendAjax('POST', $("#uesrnameForm").attr("action"), $("#usernameForm").serialize(), function () {
        loadAccountFromServer();
    });
    return false;
};
var handleEmailChange = function handleEmailChange(e) {
    e.preventDefault();

    sendAjax('POST', $("#emailForm").attr("action"), $("#emailForm").serialize(), function () {
        loadAccountFromServer();
    });
    return false;
};

var AccountInfo = function AccountInfo(props) {
    console.log(props);
    var accountInfo = props.account;
    var ad = void 0;
    if (accountInfo.type === "Basic") {
        ad = React.createElement(
            "div",
            null,
            React.createElement(
                "p",
                null,
                "You currently have a Basic account. Upgrade to a Premium account for $5 and be able to host your own competitions!"
            ),
            React.createElement(
                "form",
                { id: "upgradeForm",
                    onSubmit: handleUpgrade,
                    name: "upgradeForm",
                    action: "/upgrade",
                    method: "POST",
                    className: "domoForm"
                },
                React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                React.createElement("input", { className: "upgrade", type: "submit", value: "Upgrade Account" })
            )
        );
    }
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
                { id: "usernameForm",
                    onSubmit: handleUsernameChange,
                    name: "usernameForm",
                    action: "/username",
                    method: "POST",
                    className: "domoForm"
                },
                React.createElement(
                    "label",
                    { htmlFor: "username" },
                    "Username: "
                ),
                React.createElement("input", { id: "username", type: "text", name: "username", placeholder: "new username" }),
                React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                React.createElement("input", { className: "upgrade", type: "submit", value: "Change Username" })
            ),
            React.createElement(
                "form",
                { id: "emailForm",
                    onSubmit: handleEmailChange,
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
                React.createElement("input", { id: "email", type: "text", name: "email", placeholder: "new email" }),
                React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
                React.createElement("input", { className: "upgrade", type: "submit", value: "ChangeEmail" })
            )
        ),
        ad
    );
};
var loadAccountFromServer = function loadAccountFromServer(csrf) {
    sendAjax('GET', '/accountInfo', null, function (data) {
        ReactDOM.render(React.createElement(AccountInfo, { account: data.account, csrf: csrf }), document.querySelector("#app"));
    });
};
"use strict";

var handleCompetition = function handleCompetition(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#name").val() == '' || $("#descrip").val() == '') {
        handleError("Meow! Fill all fields please!");
        return false;
    }
    var deadline = $("#deadline").val();
    deadline = deadline.split('/');
    deadline = new Date(deadline[2], deadline[0], deadline[1]);
    //querySelector("#deadline").value =  deadline;
    sendAjax('POST', $("#competitionForm").attr("action"), $("#competitionForm").serialize(), redirect);

    return false;
};
var CompetitionWindow = function CompetitionWindow(props) {
    if (props.type === "Basic") {
        return React.createElement(
            "div",
            null,
            "You currently have a Basic account. Please upgrade to Premium to create contests."
        );
    }
    var dateObj = new Date(Date.now());
    var date = dateObj.getDate();
    var month = dateObj.getMonth();
    var year = dateObj.getFullYear();
    var csrf = props.csrf;
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
        React.createElement("input", { id: "name", type: "text", name: "name", placeholder: "name" }),
        React.createElement(
            "label",
            { htmlFor: "descrip" },
            "Description: "
        ),
        React.createElement("input", { id: "descrip", type: "text", name: "descrip", placeholder: "description" }),
        React.createElement(
            "label",
            { htmlFor: "reward" },
            "Reward: $"
        ),
        React.createElement("input", { id: "reward", type: "text", name: "reward", placeholder: "10.00" }),
        React.createElement(
            "label",
            { htmlFor: "deadline" },
            "Deadline: "
        ),
        React.createElement("input", { id: "deadline", type: "text", name: "deadline", placeholder: year + "/" + month + "/" + date }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
    );
};

var createCompetitionWindow = function createCompetitionWindow(csrf) {
    sendAjax('GET', '/accountInfo', null, function (data) {
        console.log(data);
        var type = data.account.type;
        ReactDOM.render(React.createElement(CompetitionWindow, { csrf: csrf, type: type }), document.querySelector("#app"));
    });
};
"use strict";

var handleEntry = function handleEntry(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#content").val() === '') {
        handleError("RAWR! All fields are required");
        return false;
    }

    sendAjax('POST', $("#entryForm").attr("action"), $("#entryForm").serialize(), redirect);

    return false;
};
var EntryWindow = function EntryWindow(props) {
    var csrf = props.csrf;
    var contest = props.contest;
    return React.createElement(
        "form",
        { id: "entryForm",
            name: "entryForm",
            onSubmit: handleEntry,
            action: "/entry",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "content" },
            "Content: "
        ),
        React.createElement("input", { id: "content", type: "text", name: "content", placeholder: "entry" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
        React.createElement("input", { type: "hidden", name: "contest", value: contest }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
    );
};
var createEntryWindow = function createEntryWindow(csrf, contest) {
    ReactDOM.render(React.createElement(EntryWindow, { csrf: csrf, contest: contest }), document.querySelector("#app"));
};
"use strict";

var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

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