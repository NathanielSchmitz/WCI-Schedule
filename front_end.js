
// http://jshint.com to ensure correctness.


function SchoolPeriod(period) {
    
    this.block = period['block'];
    this.start = new Date(period["start"]);
    this.end = new Date(period["end"]);
    
    this.getInfo = function() {
        
        return this.block + " " +
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
        
        while (i--)
        {
            var perStart = this.periods[i].start;
            var perEnd = this.periods[i].end;
            if ((now.getTime() >= perStart.getTime() &&
                 now.getTime() <= perEnd.getTime()))
                cpi = i;
        }
        
        return cpi;
    };
    
    this.getNextPeriod = function() {
        
        for (var i = 0, ii = this.periods.length; i < ii; i++)
            if (now.getTime() < this.periods[i].start.getTime())
                return i;
        
        return -1;
    };
    
    this.currentPeriodIndex = this.getCurrentPeriod();
    this.nextPeriodIndex = this.getNextPeriod();
    
    console.log(this.currentPeriodIndex + " " + this.nextPeriodIndex);
    
}

function init() {
    
    window.schedule = getFullSchedule();
    
    setInterval(updateDisplay, 1000);
    updateDisplay();
    
    document.getElementById('once').disabled = true;
}

function updateDisplay() {
    
    var now = new Date();
    var key = now.toDateString();
    
    var schoolDay = new SchoolDay(now, key, window.schedule);
    
    
    
    
}

function getFullSchedule() {
    
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
    
    return JSON.parse(xmlhttp.response);
}
