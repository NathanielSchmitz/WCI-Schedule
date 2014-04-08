
// http://jshint.com to ensure correctness.

function SchoolPeriod(period) {
    
    this.block = period['block'];
    this.start = new Date(period["start"]);
    this.end = new Date(period["end"]);
    
    this.getInfo = function() {
        
        return this.block + " ----- " +
        this.start.toTimeString() + " -> " +
        this.end.toTimeString();
        
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
        this.start.toTimeString() + " " +
        this.end.toTimeString();
        
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
                desc = desc + "Your first class, " + firstPeriod.block +
                       ", starts in " + getTextTimeDifference(now, firstPeriod.start) + ".";
            }
            else if (now.getTime() >= this.end) {
                desc = desc + "You have no more classes today.";
            }
            else if (this.curPerInd < 0) {
                var nextPeriod = this.periods[this.nxtPerInd];
                desc = desc + "You have " + getTextTimeDifference(now, nextPeriod.start) +
                       " to get to " + nextPeriod.block + ".";
            }
            else {
                
                var curPer = this.periods[this.curPerInd];
                desc = desc + "You have " + getTextTimeDifference(now, curPer.end) + " left in " + curPer.block + ".";
                
                if (this.nxtPerInd > 0)
                    desc = desc + " Your next period is " + this.periods[this.nxtPerInd].block + ".";
                
            }
        }
        else {
            desc = desc + "You have no school today (" + this.dayType + ").";
        }
        
        return desc;
        
    }
    
}

function init() {
    
    window.schedule = getFullSchedule();
    
    setInterval(updateDisplay, 1000);
    updateDisplay();
    
    document.getElementById('once').disabled = true;
}

function updateDisplay() {
    
    var datetime = document.getElementById('datetime');
    var debug = document.getElementById('debug');
    
    var now = new Date();
    var key = now.toDateString();
    
    var sd = new SchoolDay(now, key, window.schedule);
    var dtStr = now.toLocaleString() + " (" + sd.dayType + ")";
    
    datetime.innerHTML = dtStr + "<br>";
    debug.innerHTML = sd.getDescription() + "<br><br>";
    
    if (sd.isSchool === true)
        for (var i = 0, ii = sd.periods.length; i < ii; i++)
            debug.innerHTML = debug.innerHTML + sd.periods[i].getInfo() + "<br>";
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
    
    xmlhttp.open("GET", "full_schedule.txt", false);
    xmlhttp.send();
    
    return JSON.parse(xmlhttp.response);
}
