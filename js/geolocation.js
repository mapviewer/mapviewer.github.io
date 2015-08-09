/** 
Geolocation - [app.Geolocation] Object will handle all the possible functionalities of detecting , user's approval , fixing the map Ext. 
based on the Geolocation of the User's browser.

If the machine that is accessed is desktop/laptop that doesnt have proper GPS Utils , the networks IP will be used to get the 
Geolocation.
In case of mobile devices , the GPS Utils will be used for Geolocation.
**/


// 1.0 initializing elements
app.Geolocation._initializeElements = function () {
    app.Geolocation.PositionObtained = false;
    app.Geolocation._GetLatLong(true);
}


// 1.1 obtaining lat/long 
app.Geolocation._GetLatLong = function (IsAutoTrigger) {

    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(app.Geolocation.successHandler , app.Geolocation.errorHandler);
    } else {
        if (IsAutoTrigger == false) {
            alert("Geolocation is not supported by the browser");
        }
    }
}


// 1.2 lat/long -> success handler
app.Geolocation.successHandler = function (position) {

    app.Geolocation.latitude = position.coords.latitude;
    app.Geolocation.longitude = position.coords.longitude;
    app.Geolocation.PositionObtained = true;

    app.Geolocation.UpdateInfoInSearch(app.Geolocation.PositionObtained); 
    
}


// 1.3 lat/long -> error handler
app.Geolocation.errorHandler = function (err) {

    switch (err.code) {        
        case 1:
            alert("You have disabled access to your location.");
            break;
        case 2:
            alert("Unfortunately , Your position cannot be obtained");
            break;
         case 3:
             alert("Timeout in obtaining your location");
            break;
        default:
            alert(" Unexpected error happened in obtaining Geolocation ");
            return;    
    }

}


// 1.4 Updating information in the user's search field. --> On App Open & On Geolocation button click(in main panel)
app.Geolocation.UpdateInfoInSearch = function (IsPosition) {
    if (IsPosition) {
        $('#searchLatitude').val(app.Geolocation.latitude);
        $('#searchLongitude').val(app.Geolocation.longitude);
        app.Base.map.setCenter(new google.maps.LatLng(app.Geolocation.latitude, app.Geolocation.longitude));
        app.Base.map.setZoom(15);
    }
}


/**
  1.5 Update information in the user's search field. --> On click of geolocation button in the place's search info-window.
  Not using the geolocation Core object though.
**/

app.Geolocation.UpdateInfoInSearchForPlaces = function (Object) {

    var place = app.Base._PlaceSearchHandler.placeSearched;
    console.log(place.geometry.location);
    $('#searchLatitude').val(place.geometry.location.lat());
    $('#searchLongitude').val(place.geometry.location.lng());
    app.Base.map.setCenter(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
    app.Base.map.setZoom(15);
}





