

/* Convert a string to title case */
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){
                       return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                       });
}

/* Removes underscores and formats title case */
function toPrettyFormat(string)
{
    return toTitleCase(string.split("_").join(" "));
}

/* Called when the webpage loads to initiate the timer */
function initialize()
{
    // search for the catalog
    var xmlhttp;
    
    if (window.XMLHttpRequest)
    {
        xmlhttp = new XMLHttpRequest();
    }
    else
    {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.open("GET", "full_schedule.txt", false);
    xmlhttp.send();
    
    var text = xmlhttp.response;
    window.parsedResponse = JSON.parse(text);
    
    // validate the timer
    setInterval(update, 1000);
    update();
    
    var button = document.getElementById('once');
    button.disabled = true;
}

/* Convert seconds into text */
function secondsToString(s)
{
    // get the number of minutes/hours
    var m = Math.floor(s / 60.0);
    var h = Math.floor(s / (60.0 * 60.0));
    
    // choose the most appropriate
    var text = "";
    if (h > 0)
    {
        if (h != 1) text = h + " hours";
        else text = h + " hour";
    }
    else if (m > 0)
    {
        if (m != 1) text = m + " minutes";
        else text = m + " minute";
    }
    else
    {
        if (s != 1) text = s + " seconds";
        else text = s + " second";
    }
    
    return text;
}

function getDescription(now, type, periods, start, end)
{
    var description = "";
    
    if (type != null)
    {
        if (type.indexOf("Day ") == 0 || type.indexOf("All ") == 0)
        {
            // get the current period...
            var currentPeriodIndex = -1;
            
            for (i = 0; i < periods.length; i++)
            {
                var perStart = new Date(periods[i]["start"]);
                var perEnd = new Date(periods[i]["end"]);
                if ((now.getTime() <= perEnd.getTime() && now.getTime() >= perStart.getTime()))
                {
                    currentPeriodIndex = i;
                }
            }
            
            if (currentPeriodIndex > -1)
            {
                var period = periods[currentPeriodIndex];
                var perStart = new Date(period["start"]);
                var perEnd = new Date(period["end"]);
                var timeUntilEnd = Math.ceil((perEnd.getTime() - now.getTime()) / 1000.0);
                var timeUntilEndString = secondsToString(timeUntilEnd);
                
                var nextPeriodIndex = -1;
                if (currentPeriodIndex < periods.length - 1)
                {
                    nextPeriodIndex = currentPeriodIndex + 1;
                }
                
                description = description + timeUntilEndString + " until the end of " + period["block"] + ".";
                
                if (nextPeriodIndex > -1)
                {
                    description = description + " Your next period is " + periods[nextPeriodIndex]["block"] + ".";
                }
                else
                {
                    description = description + " You have no more classes today.";
                }
            }
            else
            {
                if (now.getTime() < start.getTime())
                {
                    var firstPeriod = periods[0];
                    var timeUntil = Math.ceil((start.getTime() - now.getTime()) / 1000.0);
                    var timeUntilString = secondsToString(timeUntil);
                    
                    description = description + timeUntilString + " until " + firstPeriod["block"] + ".";
                    description = description + " Your first period is " + firstPeriod["block"] + ".";
                }
                else if (now.getTime() > end.getTime())
                {
                    var lastPeriod = periods[periods.length - 1];
                    var timeAfter = Math.ceil((now.getTime() - end.getTime()) / 1000.0);
                    var timeAfterString = secondsToString(timeAfter);
                    
                    description = description + lastPeriod["block"] + " ended " + timeAfterString + " ago.";
                    description = description + " You are done school for today.";
                }
                else
                {
                    // the user has to be inbetween classes...
                    
                    var inbetweenIndex = 0;
                    
                    for (i = 0; i < periods.length - 1; i++)
                    {
                        var firstEnd = new Date(periods[i]["end"]);
                        var lastStart = new Date(periods[i + 1]["start"]);
                        
                        if ((now.getTime() <= lastStart.getTime() && now.getTime() >= firstEnd.getTime()))
                        {
                            inbetweenIndex = i + 1;
                        }
                    }
                    
                    var lastEnd = new Date(periods[inbetweenIndex]["start"]);
                    var timeUntil = Math.ceil((lastEnd.getTime() - now.getTime()) / 1000.0);
                    var timeUntilString = secondsToString(timeUntil);
                    
                    description = description + "You have " + timeUntilString + " until " + periods[inbetweenIndex]["block"] + ".";
                    
                }
            }
            
        }
        else
        {
            description = description + "You have no school today (" + todayType + ").";
        }
    }
    else
    {
        description = description + "The regular school year is over. Wait until next year for the update.";
    }
    
    return description;
}

/* Called every second to update the UI */
function update()
{
    // the labels that need to be updated
    var datetime = document.getElementById('datetime');
    var debug = document.getElementById('debug');
    
    // the current date and time
    var now = new Date();
    var nowKey = now.toDateString();
    
    // grab stats about today from the catalog
    var today = window.parsedResponse[nowKey];
    var type = toPrettyFormat(today["day"]);
    var periods = today["periods"];
    var start = new Date(today["start"]);
    var end = new Date(today["end"]);
    
    var datetimeString = now.toLocaleString() + " (" + type + ")";
    var dayDescription = getDescription(now, type, periods, start, end);
    
    datetime.innerHTML = datetimeString + "<br>";
    debug.innerHTML = dayDescription + "<br><br>";
    
    if (type.indexOf("Day ") == 0 || type.indexOf("All ") == 0)
    {
        var periods = today["periods"];
        for (i = 0; i < periods.length; i++)
        {
            var block = periods[i]["block"];
            var perStart = new Date(periods[i]["start"]);
            var perEnd = new Date(periods[i]["end"]);
            
            debug.innerHTML = debug.innerHTML + block + " <font size='1'>(" + perStart.toLocaleTimeString() + String.fromCharCode(32, 8594, 32) + perEnd.toLocaleTimeString() + ")</font><br>";
        }
    }
}

