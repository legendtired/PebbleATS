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
    this._sectionsForDisplay = {};
    this._yesterdayExpanded = false;
    this._tomorrowExpanded = false;
};

// Ats Instance Methods
Ats.prototype.load = function(callback) {
    var self = this;
    ajax({
            url: self._url,
            type: 'json'
        },
        function(data) {
            self.parse(data);
            callback();
        },
        function(error) {
            console.log('Download failed: ' + error);
        }
    );
};

Ats.prototype.parse = function(data) {
    this._sections.today = Ats.formatSection('today', data.today);
    this._sections.yesterday = Ats.formatSection('yesterday', data.yesterday);
    this._sections.tomorrow = Ats.formatSection('tomorrow', data.tomorrow);

    this.updateSections();
};

Ats.prototype.updateSections = function() {
    if (!this._sections) {
        return [];
    }

    var sections = [];
    if (this._yesterdayExpanded) {
        sections.push(this._sections.yesterday);
    } else {
        sections.push({
            title: "",
            items: [{
                title: "Yesterday"
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

    this._sectionsForDisplay = sections;
}

Ats.prototype.expandyesterday = function() {
    if (this._yesterdayExpanded) {
        return;
    }

    this._yesterdayExpanded = true;
    this.updateSections();
}

Ats.prototype.expandTomorrow = function() {
    if (this._tomorrowExpanded) {
        return;
    }

    this._tomorrowExpanded = true;
    this.updateSections();
}

// Ats MenuWrapper DataSource
Ats.prototype.numberOfSections = function (menu)
{
    return this._sectionsForDisplay.length;
}

Ats.prototype.sectionAtIndex = function (menu, index)
{
    return this._sectionsForDisplay[index];
}

// Ats MenuWrapper Delegate Methods
Ats.prototype.selectedRow = function (menu, section, row, title)
{
    if (title == 'Yesterday') {
        console.log('expand yesterday');
        this.expandyesterday();
    } else if (title == 'Tomorrow') {
        console.log('expand tomorrow');
        this.expandTomorrow();
    }

    menu.reloadData();
}

// Ats Util Methods
Ats.formatSection = function(title, rows) {
    var section = {
        title: title,
        items: []
    };
    var items = [];
    for (var idx in rows) {
        items.push(Ats.formatRow(rows[idx]));
    }

    section.items = items;

    return section;
}

Ats.formatRow = function(row) {
    return {
        title: row.en,
        subtitle: row.cn + '' + row.ep
    };
}

// Pebble Menu Wrapper
var MenuWrapper = function () {
    this._menu = new UI.Menu();
    this._sectionsCache = [];
    
    var self = this;
    this._menu.on('select', function (e) {
        self.select(e);
    });
}

MenuWrapper.prototype.show = function () {
    this._menu.show();
    this.reloadData();
}

MenuWrapper.prototype.dataSource = null;
MenuWrapper.prototype.delegate = null;

MenuWrapper.prototype.reloadData = function () {
    if (!this.dataSource) {
        return;
    }

    var sectionsNum = this.dataSource.numberOfSections(this);
    for (var index = 0; index < sectionsNum; index ++) {
        var section = this.dataSource.sectionAtIndex(this, index);
        if (this._sectionsCache[index] && this._sectionsCache[index] == section) {
            continue;
        }

        this._menu.section(index, section);
        this._sectionsCache[index] = section;
    }
}

MenuWrapper.prototype.select = function(e)
{
    if (!this.delegate) {
        return;
    }
    
    this.delegate.selectedRow(this, e.sectionIndex, e.itemIndex, e.item.title);
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


// load
var ats = new Ats();
var menu = new MenuWrapper();
menu.dataSource = ats;
menu.delegate = ats;

ats.load(function() {
    menu.show();
    splashWindow.hide();
});