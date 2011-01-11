function earn_trophy(trophy1, username)
{
    // alert('you clicked on the ' + trophy + ' trophy.');
    $.post("../earntrophy/", { user: username, trophy: trophy1 });
    alert("Congratulations you just earned a trophy!");
    location.reload(true);
} 

