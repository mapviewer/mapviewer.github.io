/** Prototype Extension **/

// circle contains method
google.maps.Circle.prototype.contains = function (latLng) {
    return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
}


/** Event Listener    **/
$(document).ready(function () {
    google.maps.event.addDomListener(window, 'load', app.Base._initialize);    
});


var app = app || {}; //Main Application Object
app.NearBy = {};  //Search Nearby Object
app.Base = {};    //Base Object
app.Geolocation = {}; //Geolocation Object Handler

app.Base._PlaceSearchHandler = {}; // Places search Object
 

/**   1.0   Google Maps Object Handler.          **/

app.Base._initialize = function initialize() {

    /* position Chennai */
    var latlng = new google.maps.LatLng(13.0827, 80.2707);

    var mapOptions = {
        center: latlng,
        scrollWheel: false,
        zoom: 13
    };

    app.Base.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    app.CommonUtils._initializeElements();
    app.NearBy._initializeElements();
    app.Geolocation._initializeElements();


    app.Base._PlaceSearchHandler.process();

}

/**   2.0   Place Search Handler.          **/

app.Base._PlaceSearchHandler.process = function () {

    var input = document.getElementById('freeSearch');
    app.Base.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', app.Base.map);

    google.maps.event.addListener(autocomplete, 'place_changed', function () {

        app.CommonUtils.infowindow.close();
        app.Base._PlaceSearchHandler.placeSearched = autocomplete.getPlace();

        var place = app.Base._PlaceSearchHandler.placeSearched;

        // If the place has bounds , then present it on a map.
        if (place.geometry.viewport) {
            app.Base.map.fitBounds(place.geometry.viewport);
        } else {
            app.Base.map.setCenter(place.geometry.location);
            app.Base.map.setZoom(17);  // Why 17? Because it looks good.
        }
        app.CommonUtils._setMarkerSymbol(place);
        app.CommonUtils.marker.setPosition(place.geometry.location);
        app.CommonUtils.marker.setVisible(true);

        var address = app.CommonUtils._getAddressComponentForPlace(place);
        app.CommonUtils.infowindow.setContent('<div><strong>' +
                                              '<div><i class="fa fa-globe fa-lg" style="float:right;" onClick="app.Geolocation.UpdateInfoInSearchForPlaces(this);" title="Update position in Nearby Search"> </i></div>' +
                                               place.name + 
                                              '</strong><br>' + address + '</div>');
      
        app.CommonUtils.infowindow.open(app.Base.map, app.CommonUtils.marker);

    });


    google.maps.event.addListener(app.CommonUtils.marker, 'click', function () {

        app.CommonUtils.infowindow.close();
        var place = app.Base._PlaceSearchHandler.placeSearched;
        var address = app.CommonUtils._getAddressComponentForPlace(place);
        app.CommonUtils.infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        app.CommonUtils.infowindow.open(app.Base.map, app.CommonUtils.marker);

    });
}


