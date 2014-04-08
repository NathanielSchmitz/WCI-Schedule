
function dayDifference(first, second)
{
    return (second - first) / (1000 * 60 * 60 * 24);
}

function isWeekend(datetime)
{
    return (datetime.getDay() == 6 || datetime.getDay() == 0);
}

function datesEqual(one, two)
{
    return (one.getDate() == two.getDate() &&
            one.getMonth() == two.getMonth() &&
            one.getFullYear() == two.getFullYear())
}


function ResponseXML()
{
    this.response = null;
    this.getResponseXML = function()
    {
        if (window.XMLHttpRequest)
            xmlhttp = new XMLHttpRequest();
        else
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        
        xmlhttp.open("GET", "schedule_constructor_xml.xml", false);
        xmlhttp.send();
        
        response = xmlhttp.responseXML;
        return response;
    };
    this.getResponseStartDate = function()
    {
        var start = response.getElementsByTagName("year_start");
        return new Date(start[0].childNodes[0].nodeValue);
    }
    this.getResponseEndDate = function()
    {
        var end = response.getElementsByTagName("year_end");
        return new Date(end[0].childNodes[0].nodeValue);
    }
    this.getResponseSkipDays = function()
    {
        var specialDates = response.getElementsByTagName("special_dates");
        return specialDates[0].getElementsByTagName("date");
    }
}


function DayPeriod(blockType)
{
    this.block = blockType;
    this.start = null;
    this.end = null;
}

function DaySchedule(dayType)
{
    this.day = dayType;
    this.start = null;
    this.end = null;
    this.school = false;
    this.periods = new Array();
}

function EntireScheduleConstructor()
{
    this.lengthOfSchoolYear = 0;
    this.skipDaysDict = new Object();
    this.entireSchedule = new Object();
    this.createEntireSchedule = function()
    {
        var responseXML = new ResponseXML();
        responseXML.getResponseXML();
        
        var start = responseXML.getResponseStartDate();
        var end = responseXML.getResponseEndDate();
        var skipDays = responseXML.getResponseSkipDays();
        for (i = 0; i < skipDays.length; i++)
        {
            var nodeValDate = new Date(skipDays[i].childNodes[0].nodeValue);
            var skipType = skipDays[i].parentNode.getAttribute('desc');
            this.skipDaysDict[nodeValDate.toDateString()] = skipType;
        }
        
        var trackCurrentDay = 1;
        this.lengthOfSchoolYear = dayDifference(start, end);
        
        for (i = 0; i < this.lengthOfSchoolYear; i++)
        {
            var schedule = new DaySchedule();
            
            var trackerDate = new Date(start.getTime());
            trackerDate.setDate(start.getDate() + i);
            
            var isNormal = datesEqual(trackerDate, start);
            var trackerKey = trackerDate.toDateString();
            
            if (!isWeekend(trackerDate))
            {
                var noSchool = this.skipDaysDict[trackerKey];
                if (noSchool != null)
                    schedule.day = noSchool;
                else
                    isNormal = true;
            }
            else if (isWeekend(trackerDate))
            {
                schedule.day = "weekend";
            }
            
            if (isNormal)
            {
                schedule.day = "day_" + trackCurrentDay;
                trackCurrentDay = (trackCurrentDay % 5) + 1;
            }
            
            if (schedule.day.indexOf("day_") == 0 || schedule.day.indexOf("all_") == 0)
            {
                // this day is a normal day with school...
                schedule.school = true;
                
                // get a list of the periods...
                var uppermost = response.getElementsByTagName("day_types");
                var daytype = uppermost[0].getElementsByTagName(schedule.day);
                var periods = daytype[0].getElementsByTagName("period");
                
                for (j = 0; j < periods.length; j++)
                {
                    var perObj = new DayPeriod(periods[j].getAttribute('block'));
                    
                    var startTimeString = periods[j].getAttribute('start');
                    var startDate = new Date(trackerDate.getTime());
                    var components = startTimeString.split(":");
                    startDate.setHours(parseInt(components[0]));
                    startDate.setMinutes(parseInt(components[1]));
                    perObj.start = startDate;
                    
                    if (j == 0)
                        schedule.start = startDate;
                    
                    var endTimeString = periods[j].getAttribute('end');
                    var endDate = new Date(trackerDate.getTime());
                    var components = endTimeString.split(":");
                    endDate.setHours(parseInt(components[0]));
                    endDate.setMinutes(parseInt(components[1]));
                    perObj.end = endDate;
                    
                    if (j == periods.length - 1)
                        schedule.end = endDate;

                    schedule.periods.push(perObj);
                }
            }
            
            
            this.entireSchedule[trackerKey] = schedule;
        }
        
        console.log(JSON.stringify(this.entireSchedule));
    }
}

var datetime, daytype, blocks, xmlDoc, startDate, endDate, dailySchedule;

function initialize()
{
    // initial variables
    var date = new Date();
    datetime = document.getElementById('datetime');
    daytype = document.getElementById('daytype');
    blocks = document.getElementById('blocks');
    
    var entireConstructor = new EntireScheduleConstructor();
    entireConstructor.createEntireSchedule();
//    console.log(JSON.stringify(entireConstructor.skipDaysDict));
}

function update()
{
    var date = new Date();
    
    datetime.innerHTML = date.toLocaleString() + "<br>";
//    daytype.innerHTML = "Today: " + dailySchedule[date.toDateString()] + "<br>";
//    blocks.innerHTML = "Blocks: " + "<br>";
}

function printDate()
{
    initialize();
    var timer = setInterval(update, 1000);
    var button = document.getElementById('button');
    button.disabled = true;
    update();
}
