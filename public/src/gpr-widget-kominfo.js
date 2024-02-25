(function() {
    var base = '#gpr-kominfo-widget-container';
    var customCssUrl = 'http://localhost:5500/public/src/gpr-widget-kominfo.css?v=20232910';
    var dataUrl = 'http://localhost:5500/public/src/data/covid-19/gpr.xml';
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
        var body = document.querySelector('#' + attrName.bodyId);
        if (body) body.innerHTML = 'Loading...';
    };

    var hideLoad = function() {
        var body = document.querySelector('#' + attrName.bodyId);
        if (body) body.innerHTML = '';
    }

    var printCssError = function() {
        console.log('[widget-kominfo]', 'UI not loaded');
        document.querySelector(base).innerHTML = 'Something went wrong. Please refresh this page';
    };

    var loadCss = function(url) {
        return new Promise(function(resolve, reject) {
            fetch(url, {mode:'cors'})
                .then(function(response) {
                    return response.text()
                })
                .then(resolve).catch(reject)
        });
    };

    var loadDisplay = function(fromLoadCss) {
        return new Promise(function(resolve, reject) {
            var style = document.createElement('style');
            style.innerHTML = fromLoadCss;
            document.head.appendChild(style);

            document.querySelector(base).insertAdjacentHTML('beforeend','<div id="' + attrName.headerId + '"></div>');
            document.querySelector(base).insertAdjacentHTML('beforeend','<div id="' + attrName.bodyId + '"></div>');
            document.querySelector(base).insertAdjacentHTML('beforeend','<div id="' + attrName.footerId + '"></div>');

            resolve('sukses');
        });
    }

    var loadDisplayFailed = function() {
        console.log('[widget-kominfo]', 'Failed to render');
        document.querySelector(base).innerHTML = 'Something went wrong. Please refresh this page';
    }

    var loadRss = function(fromDisplay) {
        showLoad();

        return new Promise(function(resolve, reject) {
            fetch(dataUrl, {mode:'cors'})
                .then(function(response) {
                    return response.text()
                })
                .then(resolve).catch(reject)
        });
    }

    var loadDataFail = function() {
        hideLoad();
        console.log('[widget-kominfo]', 'Data not loaded');
        document.querySelector(base).innerHTML = 'Something went wrong. Please refresh this page';
    };

    var getValue = function(item, key) {
        return item.getElementsByTagName(key)[0].childNodes[0].nodeValue
    }

    var loadFinish = function(fromRss) {
        hideLoad();
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(fromRss,"text/xml");
        var items = xmlDoc.getElementsByTagName('item');

        document.querySelector('#' + attrName.bodyId).insertAdjacentHTML('beforeend','<ul id="' + attrName.ulId + '"></ul>')

        for(i = 0; i < MAXITEMS; i++) {
            var title = getValue(items[i],'title');
            var link = getValue(items[i],'link');
            var pubDate = getValue(items[i],'pubDate');
            var categoryIcon = getValue(items[i],'icon_class');
            var categoryTitle = getValue(items[i],'category_title');

            document.querySelector('#' + attrName.ulId).insertAdjacentHTML('beforeend','<li class="' + attrName.itemClass
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

    document.addEventListener("DOMContentLoaded", function(event) {
        loadCss(customCssUrl).catch(printCssError)
            .then(loadDisplay).catch(loadDisplayFailed)
            .then(loadRss).catch(loadDataFail)
            .then(loadFinish);
    });
})();
