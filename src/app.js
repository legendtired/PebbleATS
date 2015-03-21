/**
 * ATV Series Schedule (Chinese)
 * Beijing Time
 *
 * @author: legend <legendsky@hotmail.com>
 */
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

// Ats Class
var Ats = function() {
    this._url = 'http://resmx.com/ats/';
    this._sections = {};
    this._yestodayExpanded = false;
    this._tomorrowExpanded = false;
};

Ats.prototype.load = function(callback) {
    var self = this;
    ajax({
            url: self._url,
            type: 'json'
        },
        function(data) {
            self.parse(data);
            callback(self.sections());
        },
        function(error) {
            console.log('Download failed: ' + error);
        }
    );
};

Ats.prototype.parse = function(data) {
    this._sections.today = Ats.getSection('today', data.today);
    this._sections.yestoday = Ats.getSection('yestoday', data.yestoday);
    this._sections.tomorrow = Ats.getSection('tomorrow', data.tomorrow);
};

Ats.prototype.sections = function() {
    if (!this._sections) {
        return [];
    }

    var sections = [];
    if (this._yestodayExpanded) {
        sections.push(this._sections.yestoday);
    } else {
        sections.push({
            title: "",
            items: [{
                title: "Yestoday"
            }]
        });
    }

    sections.push(this._sections.today);

    if (this._tomorrowExpanded) {
        sections.push(this._sections.tomorrow);
    } else {
        sections.push({
            title: "",
            items: [{
                title: "Tomorrow"
            }]
        });
    }

    return sections;
}

Ats.prototype.expandYestoday = function(callback) {
    if (this._yestodayExpanded) {
        return;
    }

    this._yestodayExpanded = true;
    callback(this.sections());
}

Ats.prototype.expandTomorrow = function(callback) {
    if (this._tomorrowExpanded) {
        return;
    }

    this._tomorrowExpanded = true;
    callback(this.sections());
}

Ats.getSection = function(title, rows) {
    var section = {
        title: title,
        items: []
    };
    var items = [];
    for (var idx in rows) {
        items.push(Ats.getItem(rows[idx]));
    }

    section.items = items;

    return section;
}

Ats.getItem = function(row) {
    return {
        title: row.en,
        subtitle: row.cn + '' + row.ep
    };
}



// UI
var splashWindow = new UI.Window({
    fullscreen: true,
    backgroundColor: 'white'
});

var imageLogo = new UI.Image({
    position: new Vector2(22, 10),
    size: new Vector2(100, 80),
    image: 'images/logo.png'
});
splashWindow.add(imageLogo);

var text = new UI.Text({
    position: new Vector2(0, 100),
    size: new Vector2(144, 24),
    text: 'loading...',
    font: 'GOTHIC_24_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
});

splashWindow.add(text);

// Text element to inform user
var sourceText = new UI.Text({
    position: new Vector2(0, 140),
    size: new Vector2(144, 20),
    text: 'source: zimuzu.tv',
    font: 'GOTHIC_14',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
});

// Add to splashWindow and show
splashWindow.add(sourceText);
splashWindow.show();


// Result Menu
var resultsMenu = new UI.Menu();
var reloadSections = function(sections) {
    for (var i = 0; i < sections.length; i++) {
        resultsMenu.section(i, sections[i]);
    }
};

resultsMenu.on('select', function(e) {
    if (e.item.title == 'Yestoday') {
        console.log('expand yestoday');
        ats.expandYestoday(reloadSections);
    } else if (e.item.title == 'Tomorrow') {
        console.log('expand tomorrow');
        ats.expandTomorrow(reloadSections);
    }
});

// Load
var ats = new Ats();
ats.load(function(sections) {
    reloadSections(sections);

    resultsMenu.show();
    splashWindow.hide();
});