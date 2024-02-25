(function() {
    var Q = jQuery.noConflict(true);
    var base = '#gpr-kominfo-widget-container';
    var customCssUrl = 'http://wbksrc/gpr-widget-kominfo.css?v=20232910';
    var dataUrl = 'http://wbksrc/data/covid-19/gpr.xml';
    var MAXITEMS = 10;
    var attrName = {
        headerId: 'gpr-kominfo-widget-header',
        bodyId: 'gpr-kominfo-widget-body',
        footerId: 'gpr-kominfo-widget-footer',
        ulId: 'gpr-kominfo-widget-list',
        itemClass: 'gpr-kominfo-widget-list-item',
    };

   var displayDate = function(dateString) {
      var prependZero = function(num) {
         return num < 10 ? ("0" + num) : num;
      };

      if(typeof dateString == "string") {
         var tgl = new Date(dateString);

         if(tgl != "Invalid Date") {
            return [
               prependZero(tgl.getDate()),
               prependZero((tgl.getMonth() + 1)),
               tgl.getFullYear()
            ].join("-") + " " +
            [
               prependZero(tgl.getHours()),
               prependZero(tgl.getMinutes())
            ].join(":");
         }
      }

      return "";
   };

    var showLoad = function() {
        Q('#' + attrName.bodyId).html('Loading...');
    };

    var hideLoad = function() {
        Q('#' + attrName.bodyId).html('');
    }

    var printCssError = function() {
        console.log('[widget-kominfo]', 'UI not loaded');
        Q(base).html('Something went wrong. Please refresh this page');
    };

    var loadCss = function(url) {
        return new Promise(function(resolve, reject) {
            Q.ajax(url, {
                type: 'GET',
                crossDomain: true
            })
                .done(resolve)
                .fail(reject);
        });
    };

    var loadDisplay = function(fromLoadCss) {
        return new Promise(function(resolve, reject) {

            Q('<style>').html(fromLoadCss)
                .appendTo('head');

            Q(base).append('<div id="' + attrName.headerId + '"></div>');
            Q(base).append('<div id="' + attrName.bodyId + '"></div>');
            Q(base).append('<div id="' + attrName.footerId + '"></div>');

            resolve('sukses');
        });
    }

    var loadDisplayFailed = function() {
        console.log('[widget-kominfo]', 'Failed to render');
        Q(base).html('Something went wrong. Please refresh this page');
    }

    var loadRss = function(fromDisplay) {
        showLoad();

        return new Promise(function(resolve, reject) {
            Q.ajax(dataUrl, {
                type: 'GET',
                crossDomain: true
            })
                .done(resolve)
                .fail(reject);
        });
    }

    var loadDataFail = function() {
        hideLoad();
        console.log('[widget-kominfo]', 'Data not loaded');
        Q(base).html('Something went wrong. Please refresh this page');
    };

    var loadFinish = function(fromRss) {
        hideLoad();
        var items = Q(fromRss).find('item');

        Q('#' + attrName.bodyId).append('<ul id="' + attrName.ulId + '"></ul>')

        for(i = 0; i < MAXITEMS; i++) {
            var title = Q(items[i]).find('title').text();
            var link = Q(items[i]).find('link').text();
            var desc = Q(items[i]).find('description').text();
            var pubDate = Q(items[i]).find('pubDate').text();
            var category = Q(items[i]).find('category').text();
            var author = Q(items[i]).find('author').text();
            var categoryIcon = Q(items[i]).find('icon_class').text();
            var categoryTitle = Q(items[i]).find('category_title').text();

            Q('#' + attrName.ulId).append('<li class="' + attrName.itemClass
                + ' ' + categoryIcon + '">'
                + '<small class="gpr-kominfo-align-left"><b>'
                     + categoryTitle.replace(" GPR", "") + '</b></small>'
                + '<small class="gpr-kominfo-align-right gpr-small-date">'
                     + displayDate(pubDate) + '</small>'
                + '<br /><a href="'
                  + link + '" target="_blank">'+ title +'</a>'
                // + '<br /><b>desc</b>: ' + desc
                // + '<br /><small class="gpr-kominfo-align-right">' + author + '</small>'
                + '<div class="gpr-kominfo-clear-fix"></div>'
            + '</li>');
        }
    }

    Q(document).ready(function() {
        loadCss(customCssUrl).catch(printCssError)
            .then(loadDisplay).catch(loadDisplayFailed)
            .then(loadRss).catch(loadDataFail)
            .then(loadFinish);
    });
})();
