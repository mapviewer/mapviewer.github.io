app.CommonUtils = {};   //common utils Object that will hold all possible common config and functions



/** 1.0 creating common elements that will be used throughout the application   **/
app.CommonUtils._initializeElements = function () {

    app.CommonUtils.marker = new google.maps.Marker({
        map: app.Base.map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    app.CommonUtils.infowindow = new google.maps.InfoWindow();

}



/** 2.0 Markers Handler **/

//  2.1 Setting markers symbol.
app.CommonUtils._setMarkerSymbol = function (place) {

    app.CommonUtils.marker.setIcon(({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    }));
}



/** 3.0  Infowindow Handler (config & content )   **/

//  3.1  Get address component from place.

app.CommonUtils._getAddressComponentForPlace = function (place) {

    var address = '';
    if (place.address_components) {
        address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    return address;
}



/** 4.0 Graphics & infowindow and all overlays General Handler  **/

//  4.1 Clearing of all the overlays

app.CommonUtils._ClearOverlays = function () {

    /** Graphics & Info-Window removal  **/

    if (app.NearBy.MarkersArray != undefined) {
        app.NearBy.MarkerRemoveHandler(app.NearBy.MarkersArray);
    } // markers in Nearby Search.

    if (app.NearBy.circleOverlayObj != undefined) {
        app.NearBy.circleOverlayObj.setMap(null);
    } // circle (overlay) in Nearby Search.

    app.CommonUtils.infowindow.close(); // closing all the infowindows.
    app.NearBy.DirectionsRenderer.setMap(null); //route graphics in Nearby Search.
    $("#DirectionsPanel").html(""); //directions provided in Nearby Search.

    app.CommonUtils.marker.setVisible(false); // removing markers of places search.

}






