
// http://jshint.com to ensure correctness.

function SchoolPeriod(period) {
    
    this.block = period['block'];
    this.name = window.urlParameters[this.block];
    this.start = new Date(period["start"]);
    this.end = new Date(period["end"]);
    
    this.getInfo = function() {
        
        return "<td align='center'>" + this.block + "</td><td>" +
        this.name + "</td><td>" +
        formatDate(this.start, "hh:mm TT", false) + "</td>";
        
    };
}

function NextSchoolDay(key, catalog) {
    
    this.day = catalog[key];
    
    this.dayType = this.day["day"];
    this.isSchool = (this.dayType.indexOf("day") === 0 ||
                     this.dayType.indexOf("all") === 0);
    
    this.getPeriodObjects = function() {
        
        var n = [];
        var p = this.day["periods"];
        for (var i = 0, ii = p.length; i < ii; i++)
            n.push(new SchoolPeriod(p[i]));
        return n;
        
    };
    
    this.periods = this.getPeriodObjects();
    
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

function createCard(now, key, today) {
    
    var cardText = "<div class='card'>";
    
    if (today === true) {
        
        var school = new SchoolDay(now, key, window.schedule);
        
        console.log(school.getInfo());
        
        var niceDate = toNiceFormat(school.dayType);
        var dateFormat = "ddd, MMM d \\a\\t h:mm:ss TT";
        var header = formatDate(now, dateFormat, false) + " (" + niceDate + ")";
        
        cardText = cardText + "<h4>" + header + "</h4>";
        cardText = cardText + "<p>" + school.getDescription() + "</p>";
        
        var tableText = "";
        if (school.isSchool === true) {
            tableText = "<br>";
            tableText = tableText + "<table border='1'><tr><th>Block</th><th>Name</th><th>Start</th></tr>";
            for (var i = 0, ii = school.periods.length; i < ii; i++)
                tableText = tableText + "<tr>" + school.periods[i].getInfo() + "</tr>";
            tableText = tableText + "</table>";
        }
        cardText = cardText + tableText;
        cardText = cardText + "</div>";

    } else {
        
        var school = new NextSchoolDay(key, window.schedule);
        var niceDate = toNiceFormat(school.daytype);
        var dateFormat = "ddd, MMM d";
        var header = formatDate(now, dateFormat, false) + " (" + niceDate + ")";
        
        cardText = cardText + "<h4>" + header + "</h4>";
        
        var tableText = "";
        if (school.isSchool === true) {
            tableText = "<br>";
            tableText = tableText + "<table border='1'><tr><th>Block</th><th>Name</th><th>Start</th></tr>";
            for (var i = 0, ii = school.periods.length; i < ii; i++)
                tableText = tableText + "<tr>" + school.periods[i].getInfo() + "</tr>";
            tableText = tableText + "</table>";
        }
        cardText = cardText + tableText;
        cardText = cardText + "</div>";
        
    }
    
    return cardText;
    
}

function updateDisplay() {
    
    // a div where the cards will be written to
    var card = document.getElementById('cards');
    
    // create the first card
    var now = new Date();
    var key = now.toDateString();
	card.innerHTML = createCard(now, key, true);
    
    // get the next school day
    var newDate = addDays(now, i + 2);
    card.innerHTML = createCard(newDate, newDate.toDateString(), false);

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

