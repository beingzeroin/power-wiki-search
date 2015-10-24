(function() {

    // ubaciti jezik
    // veliku sliku za glavni clanak
    // sacuvati podesavanja (jezik, broj rez) u local storage
    // commons treba da pretrazuje i otvara fajlove, ne clanke
    // primer paramUrl u dokumentaciju
    // bug: trazim zen na wiki, pa na recniku, pa opet na wiki, a lead ostane sa recnika

/*
    za naziv slike vraca url:
    https://en.wikipedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg&prop=imageinfo&iiprop=url
    mozemo dodati i zeljenu sirinu: &iiurlwidth=220

    vraca nadjene slike za trazeni termin:
    https://en.wikipedia.org/w/api.php?action=query&list=allimages&aiprop=url&format=json&ailimit=10&aifrom=Albert

    alternativni commonsapi:
    https://tools.wmflabs.org/magnus-toolserver/commonsapi.php
    vraca info o slici i url:
    https://tools.wmflabs.org/magnus-toolserver/commonsapi.php?image=Albert_Einstein_Head.jpg
*/

    'use strict';
    angular
        .module("wikiModul", ['ngSanitize'])
        .controller('WikiController', WikiController)
        .directive('autofocus', ['$timeout', autofocus]);

    function WikiController($http, $window) {

        var wiki = this;
        wiki.apiUrl = updateBaseUrl();
        wiki.lang = 'en';
        wiki.domain = 'wikipedia';
        wiki.apiUrl = 'http://' + wiki.lang + '.' + wiki.domain + '.org/w/api.php';
        wiki.term = 'zen'; // default
        wiki.searchFilter = "intitle:";
        wiki.page = null;
        wiki.results = null;
        wiki.error = "";
        wiki.leadLarge = false;

        wiki.pageParams = {
            titles: wiki.term
        };

        wiki.searchParams = {
            generator: 'search',
            gsrsearch: wiki.term + wiki.searchFilter,
            gsrlimit: 20, // broj rezultata, max 50
            pilimit: 'max', // thumb image for all articles
            exlimit: 'max', // extract for all articles
            imlimit: 'max', // images in articles
            exintro: '' // extracts intro
        };

        // defaul params both for open and search
        var commonParams = {
            action: 'query',
            prop: 'extracts|pageimages|images',
            redirects: '', // automatically resolve redirects
            format: 'json',
            formatversion: 2,
            callback: 'JSON_CALLBACK'
        };


        /*** PUBLIC METHODS ***/

        wiki.searchWikipedia = function() { // mozda ne treba ulazni argument
            updateBaseUrl();
            updateSearchTerm();
            var paramUrl = createParamUrl(wiki.searchParams);

            $http.jsonp(paramUrl)
                .success(function(data) {
                    if (!data.query) {
                        wiki.emptyResults();
                        return false;
                    }
                    wiki.results = data.query.pages;
                    wiki.openArticle(wiki.term);
                })
                .error(handleErrors);
        }; // searchWikipedia


        wiki.openArticle = function(title) {
            if (isPageOpen(title)) {
                return;
            }
            wiki.pageParams.titles = title;
            var paramUrl = createParamUrl(wiki.pageParams);

            $http.jsonp(paramUrl)
                .success(function(data) {
                    if (!data.query) return;
                    wiki.page = data.query.pages[0];
                    removeLeadFromList(title, data.query.redirects);
                })
                .error(handleErrors);
        }; // openArticle


        wiki.searchInDomain = function(domainName) {
            setDomainName(domainName);
            wiki.searchWikipedia();
        };   // searchInDomain


        wiki.searchForLeadTerm = function(title) {
            if (wiki.leadLarge) {
                wiki.term = title;
                wiki.searchWikipedia(title, wiki.searchParams);
            }
            wiki.toggleLeadLarge();
        }; // searchForLeadTerm


        wiki.openLarge = function(title) {
            wiki.page = '';
            wiki.openArticle(title);
            wiki.leadLarge = true;
        }; // openLarge


        wiki.toggleLeadLarge = function() {
            wiki.leadLarge = !wiki.leadLarge;
        }; // toggleLeadLarge


        wiki.selectText = function() {
            var text = $window.getSelection().toString();
            wiki.term = text;
        }; // toggleLeadLarge


        wiki.leadHoverText = function() {
            return wiki.leadLarge ? "Search for this term" : "Englarge this article";
        };  // leadHoverText


        wiki.emptyResults = function() {
            wiki.results = [];
            wiki.page = "";
        }; // emptyResults


        wiki.checkMax = function() {
            if (wiki.searchParams.gsrlimit > 50) wiki.searchParams.gsrlimit = 50;
        }; // checkMax


        /*** HELPER FUNCTIONS ***/

        function setDomainName(domainName) {
            wiki.domain = domainName;
        }   // setDomainName

        function updateBaseUrl() {
            wiki.apiUrl = 'http://' + wiki.lang + '.' + wiki.domain + '.org/w/api.php';
            if(wiki.domain == 'commons') wiki.apiUrl = 'http://commons.wikimedia.org/w/api.php';
        }   // updateBaseUrl

        function updateSearchTerm() {
            wiki.searchParams.gsrsearch = wiki.searchFilter + wiki.term;
        } // updateSearchTerm

        function isPageOpen(title) {
            return (wiki.page && (wiki.page.title == title));
        }   // isPageOpen

        function removeLeadFromList(term, redirects) {
            for (var x in wiki.results) {
                if (wiki.results[x].title == capitalizeFirst(term)) {
                    wiki.results.splice(x, 1); // remove it from the list
                }
                if (!redirects) return wiki.results;
                for (var r in redirects) {
                    if (redirects[r].to == wiki.results[x].title) {
                        wiki.results.splice(x, 1);
                    }
                }
            } // end for
            return wiki.results;
        } // removeLeadFromList

        function handleErrors() {
            wiki.error = "Oh no, there was some error in geting data.";
        } // handleErrors

        function createParamUrl(params) {
            angular.extend(params, commonParams);
            var paramUrl = wiki.apiUrl + '?' + serialize(params);
            console.log(paramUrl);
            return paramUrl;
        } // createParamUrl

        function serialize(params) {
            var paramString = Object.keys(params).map(function(key) {
                return key + '=' + encodeURIComponent(params[key]);
            }).join('&');
            return (paramString);
        } // serialize

        function capitalizeFirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        } // capitalizeFirst

    } // WikiController


    function autofocus($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        };
    }   // autofocus

})();
