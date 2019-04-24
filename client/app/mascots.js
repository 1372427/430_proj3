//React Component to show all mascots
const MascotList = (props) => {
    //hide error message
    $("#domoMessage").animate({width:'hide'}, 350);

    //for each mascot, show their image and name
    const mascotNodes = (Object.keys(props.mascots)).map(function(mascot){
        return(
            <div id={mascot}  className="domo" onClick={ (e) => handleMascotClick(e, mascot)}>
                <img src={`/assets/img/mascots/${props.mascots[mascot]}`} alt="mascot" className="accountFace"/>
                <div className="domoContent">
                <h3 >Name: {mascot}</h3> 
                </div>
            </div>
        );
    });

    //show all mascots in list
    return (
        <div className="domoList">
            {mascotNodes}
        </div>
    );
}

//send selected mascot to server then reload the page to activate mascot
const handleMascotClick = (e, mascot) => {
    sendAjax('POST', '/mascots', `mascot=${mascot}&_csrf=${csrf}`, function() {
        location.reload();
    });
};