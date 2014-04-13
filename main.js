
// http://jshint.com to ensure correctness.

function formatDate(date, format, utc) {
	
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    function ii(i, len) { var s = i + ""; len = len || 2; while (s.length < len) s = "0" + s; return s; }
    
    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);
    
    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);
    
    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);
    
    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);
    
    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);
    
    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);
    
    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);
    
    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);
    
    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));
    
    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));
    
    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc)
    {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);
    
    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);
    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);
    format = format.replace(/\\(.)/g, "$1");
    
    return format;
}

function SchoolPeriod(period) {
    
    this.block = period['block'];
    this.name = window.urlParameters[this.block];
    this.start = new Date(period["start"]);
    this.end = new Date(period["end"]);
    
    this.getInfo = function() {
        
        return "<td align='center'>" + this.block + "</td><td>" +
        this.name + "</td><td>" +
        formatDate(this.start, "hh:mm:ss TT", false) + "</td>";
        
    };
}

function SchoolDay(now, key, catalog) {
    
    this.day = catalog[key];
    
    this.dayType = this.day["day"];
    this.isSchool = (this.dayType.indexOf("day") === 0 ||
                     this.dayType.indexOf("all") === 0);
    
    this.start = new Date(this.day["start"]);
    this.end = new Date(this.day["end"]);
    
    this.getPeriodObjects = function() {
        
        var n = [];
        var p = this.day["periods"];
        for (var i = 0, ii = p.length; i < ii; i++)
            n.push(new SchoolPeriod(p[i]));
        return n;
        
    };
    
    this.periods = this.getPeriodObjects();
    
    this.getInfo = function() {
        
        return this.dayType + " " +
        this.isSchool + " " +
        this.start.toLocaleTimeString() + " " +
        this.end.toLocaleTimeString();
        
    };
    
    this.getCurrentPeriod = function() {
        
        var cpi = -1;
        var i = this.periods.length;
        
        while (i--) {
            
            var perStart = this.periods[i].start;
            var perEnd = this.periods[i].end;
            if ((now.getTime() >= perStart.getTime() &&
                 now.getTime() <= perEnd.getTime())) {
                cpi = i;
            }
        }
        
        return cpi;
    };
    
    this.getNextPeriod = function() {
        
        for (var i = 0, ii = this.periods.length; i < ii; i++)
            if (now.getTime() < this.periods[i].start.getTime())
                return i;
        
        return -1;
    };
    
    this.curPerInd = this.getCurrentPeriod();
    this.nxtPerInd = this.getNextPeriod();
    
    this.getDescription = function() {
        
        var desc = "";
        
        if (this.isSchool === true) {
            
            if (now.getTime() < this.start) {
                var firstPeriod = this.periods[this.nxtPerInd];
                desc = desc + "Your first class, " + firstPeriod.name +
                ", starts in " + getTextTimeDifference(now, firstPeriod.start) + ".";
            }
            else if (now.getTime() >= this.end) {
                desc = desc + "You have no more classes today.";
            }
            else if (this.curPerInd < 0) {
                var nextPeriod = this.periods[this.nxtPerInd];
                desc = desc + "You have " + getTextTimeDifference(now, nextPeriod.start) +
                " to get to " + nextPeriod.name + ".";
            }
            else {
                
                var curPer = this.periods[this.curPerInd];
                desc = desc + "You have " + getTextTimeDifference(now, curPer.end) + " left in " + curPer.name + ".";
                
                if (this.nxtPerInd > 0)
                    desc = desc + " Your next period is " + this.periods[this.nxtPerInd].name + ".";
                
            }
        }
        else {
            desc = desc + "You have no school today.";
        }
        
        return desc;
        
    }
    
}

function toNiceFormat(text) {
    var nt = text.split('_').join(' ');
    return toSentenceCase(nt);
}

function toSentenceCase(text) {
    return text.toLowerCase().replace(/\b[a-z](?=[a-z]{2})/g,
                                      function(letter) { return letter.toUpperCase(); } );
}

function getUrlParameters() {
    
    var x = new Object();
    
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var name = pair[1].split('+').join(' ');
        x[pair[0].toUpperCase()] = toSentenceCase(name);
    }
    
    return x;
}

function init() {
    
    window.urlString = window.location.toString();
    window.urlParameters = getUrlParameters();
    window.schedule = getFullSchedule();
    
    setInterval(updateDisplay, 1000);
    updateDisplay();
    
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function updateDisplay() {
    
    var card = document.getElementById('cards');
    
    var now = new Date();
    var key = now.toDateString();
    
    var sd = new SchoolDay(now, key, window.schedule);
    var dtStr = formatDate(now, 'ddd, MMM d \\a\\t h:mm:ss TT', false) + " (" + toNiceFormat(sd.dayType) + ")";
    
	var firstCard = "<div class='card'>"
    firstCard = firstCard + "<h4>" + dtStr + "</h4>";
    firstCard = firstCard + "<p>" + sd.getDescription() + "</p>";
    var tableText = "";
    if (sd.isSchool === true) {
		tableText = "<br>";
        tableText = tableText + "<table border='1'><tr><th>Block</th><th>Name</th><th>Start</th></tr>";
        for (var i = 0, ii = sd.periods.length; i < ii; i++)
            tableText = tableText + "<tr>" + sd.periods[i].getInfo() + "</tr>";
        tableText = tableText + "</table>";
    }
	firstCard = firstCard + tableText;
	firstCard = firstCard + "</div>";
	
	card.innerHTML = firstCard;
    
//    var totalText = "";
//    var i = 1;
//    while (i > 0) {
//
//        var newDate = addDays(now, i + 1);
//        var newCard = "<div class='card'>";
//        var nowSd = new SchoolDay(newDate, newDate.toDateString(), window.schedule);
//        
//        console.log(nowSd.getInfo());
//        
//        if (nowSd.isSchool === true) {
//            
//            var dtStr = formatDate(newDate, 'ddd, MMM d', false) + " (" + toNiceFormat(nowSd.dayType) + ")";
//            
//            newCard = newCard + "<h4>" + dtStr + "</h4>";
//            var tableText = "";
//            tableText = "<br>";
//            tableText = tableText + "<table border='1'><tr><th>Block</th><th>Name</th><th>Start</th></tr>";
////            for (var i = 0, ii = nowSd.periods.length; i < ii; i++)
////                tableText = tableText + "<tr>" + nowSd.periods[i].getInfo() + "</tr>";
//            tableText = tableText + "</table>";
//            newCard = newCard + tableText;
//
//            newCard = newCard + "</div>";
//            totalText = totalText + newCard;
//            
//            i = i - 1;
//        }
//        
//    }
    
//    console.log(totalText);
    
    card.innerHTML = card.innerHTML + totalText;

}

function getWordsFromSeconds(s) {
    var m = Math.floor(s / 60.0);
    var h = Math.floor(s / (60.0 * 60.0));
    if (h > 0) return h + " hour" + ((h != 1) ? "s" : "");
    else if (m > 0) return m + " minute" + ((m != 1) ? "s" : "");
    else return s + " second" + ((s != 1) ? "s" : "");
}

function getTextTimeDifference(first, second) {
    var s = Math.ceil((second.getTime() - first.getTime()) / 1000.0);
    return getWordsFromSeconds(s);
}

function getFullSchedule() {
    
    var xmlhttp;
    
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.open("GET", "resources/full_schedule.txt", false);
    xmlhttp.send();
    
    return JSON.parse(xmlhttp.response);
}

