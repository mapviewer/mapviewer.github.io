
/** Search button event listener **/
$("#searchButton").on("click", function (e) { app.NearBy.onClickHandler(); });


// Initializing necessary Google Map's API Objects for later consumption.
app.NearBy._initializeElements = function () {
    app.NearBy.PlacesService = new google.maps.places.PlacesService(app.Base.map);
    app.NearBy.DistanceMatrixService = new google.maps.DistanceMatrixService();
    app.NearBy.DirectionsService = new google.maps.DirectionsService();
    app.NearBy.DirectionsRenderer = new google.maps.DirectionsRenderer();
    app.NearBy.DirectionsRenderer.setPanel(document.getElementById('DirectionsPanel'));
}


/** 1.0 onClick Handler. **/
app.NearBy.onClickHandler = function () {

    // * Gathering info & pre-process executables    
    $("#searchErrorMessageDiv").html(""); // setting the div back to the default state if there were any error messages shown.

    app.NearBy.latitude = $("#searchLatitude").val();
    app.NearBy.longitude = $("#searchLongitude").val();
    app.NearBy.category = $("#searchCategory").val();
    app.NearBy.radius = $("#searchRadius").val();


    // * creating the circle (overlay)
    if (app.NearBy.circleOverlayObj != undefined) {
        app.NearBy.circleOverlayObj.setMap(null);
    }

    var circleOptions = {
        strokeColor: '#191970',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#000000',
        fillOpacity: 0.15,
        map: app.Base.map,
        center: new google.maps.LatLng(app.NearBy.latitude, app.NearBy.longitude),
        radius: app.NearBy.radius * 1000
    };
    app.NearBy.circleOverlayObj = new google.maps.Circle(circleOptions);


    // * Places request and results 
    var validation_boolean = app.NearBy.Validation([app.NearBy.latitude, app.NearBy.longitude, app.NearBy.category, app.NearBy.radius]); //calling the validation function to check if the input provided are correct.
    if (validation_boolean) {
        app.NearBy.PlacesRequestHandler([app.NearBy.latitude, app.NearBy.longitude, app.NearBy.category, app.NearBy.radius]);
    }

    // * setting map to center
    app.Base.map.setCenter(new google.maps.LatLng(app.NearBy.latitude, app.NearBy.longitude));
    app.Base.map.fitBounds(app.NearBy.circleOverlayObj.getBounds());

}

// 1.1 Places Reauest Object & config Options.
app.NearBy.PlacesRequestHandler = function (arr) {

    var request = {};
    var latlongobj = new google.maps.LatLng(arr[0], arr[1]);

    /** request params **/
    request.location = latlongobj;
    request.radius = arr[3] * 1000;
    request.query =  arr[2];
    // request.types = app.NearBy.placesTypeSync[arr[2]];    //commented out because of poor results obtained in call back.

    app.NearBy.PlacesService.textSearch(request, app.NearBy.PlacesCallbackHandler);
}

// 1.2 Request Callback Handler & Status Handler
app.NearBy.PlacesCallbackHandler = function (results, status) {

    switch (status) {
        case "OK":
            app.NearBy.PlacesResultsDisplayHandler(results);

            // * Distance Matrix Calculation
            app.NearBy.DistanceMatrixRequestHandler(app.NearBy.MarkersArray);

            break;

        case "ERROR":
            $("#searchErrorMessageDiv").html("There was a problem contacting the Google servers.");
            break;

        case "INVALID_REQUEST":
            $("#searchErrorMessageDiv").html("The request sent was invalid.");
            break;

        case "OVER_QUERY_LIMIT":
            $("#searchErrorMessageDiv").html("This webpage has gone over its request quota. Cannot fetch the results");
            break;

        case "REQUEST_DENIED":
            $("#searchErrorMessageDiv").html("he webpage is not allowed to use the PlacesService.");
            break;

        case "UNKNOWN_ERROR":
            $("#searchErrorMessageDiv").html("The PlacesService request could not be processed due to a server error. The request may succeed if you try again.");
            break;

        case "ZERO_RESULTS":
            $("#searchErrorMessageDiv").html("No result was found for this request.");
            break;
    }
}

// 1.3 Result Display & Marker Array set Handler
app.NearBy.PlacesResultsDisplayHandler = function (Results) {

    app.NearBy.MarkerRemoveHandler(app.NearBy.MarkersArray); // clearing all the overlays before adding new batch.
    app.NearBy.MarkersArray = [];
    app.NearBy.PlacesArray = [];

    app.NearBy.PlacesArray = Results;

    for (var i = 0; i < Results.length; i++) {
        if (app.NearBy.circleOverlayObj.contains(Results[i].geometry.location)) {
            app.NearBy.PlacesResultsMarkerAddHandler(Results[i]);
        }
    }
}

// 1.4 Icon setter & individual marker adder
app.NearBy.PlacesResultsMarkerAddHandler = function (placeObject) {

    var marker = new google.maps.Marker({
        map: app.Base.map,
        anchorPoint: new google.maps.Point(0, -29)
    }); //creating new marker object

    marker.setIcon(({
        url: "/assets/images/markers/" + app.NearBy.iconSync[app.NearBy.category] + ".png",
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    })); //setting corresponding icon


    marker.setPosition(placeObject.geometry.location);
    marker.setVisible(true);
    app.NearBy.MarkersArray.push(marker);
   

    google.maps.event.addListener(marker, 'click', app.NearBy.PlacesResultsMarkerclickHandler);


}


// 1.5 Distance Matrix Calculation - Request Object Handler
app.NearBy.DistanceMatrixRequestHandler = function (MarkersArray) {


    //Creating Origin & Destination arrays
    var origins = [ new google.maps.LatLng(app.NearBy.latitude, app.NearBy.longitude) ];
    var destinations = app.NearBy.DistanceMatrixDestinationsHandler(MarkersArray);

    // Distance Matrix Request Object.
    var Request = {};
    Request.avoidFerries = true;
    Request.avoidHighways = false;
    Request.avoidTolls = false;
    Request.travelMode = google.maps.TravelMode.DRIVING;
    Request.unitSystem = google.maps.UnitSystem.METRIC;
    Request.origins = origins;
    Request.destinations = destinations;

    app.NearBy.DistanceMatrixService.getDistanceMatrix(Request, app.NearBy.DistanceMatrixCallBackHandler);

}

// 1.6 Distance Matrix Calculation - CallBack Handler
app.NearBy.DistanceMatrixCallBackHandler = function (response, status) {
    if (status == "OK") {
        var distArray = [];
        for (var i = 0; i < response.rows[0].elements.length; i++) { distArray.push(parseFloat(response.rows[0].elements[i].distance.text.slice(0, -2))); }
        var shortest = Math.min.apply(Math, distArray);
        shortest = shortest + " km";

        var ResObj = JSLINQ(response.rows[0].elements).Where(function (item) { return item.distance.text == shortest; });
        var ResObjIndex = response.rows[0].elements.indexOf(ResObj.items[0]);

        app.NearBy.MarkersInfoWinAndRouteHandler(app.NearBy.PlacesArray[ResObjIndex], ResObjIndex);
    }
}

// 1.7 Distance Matrix Calculation - Destination Array Creator
app.NearBy.DistanceMatrixDestinationsHandler = function (MarkersArray) {

    var result = [];

    for (var i = 0; i < MarkersArray.length; i++) {
        result.push(MarkersArray[i].getPosition());
    }

    return result;
}


// 1.8 OnClick Handler for Markers - Info-Window popup & Directions
app.NearBy.MarkersInfoWinAndRouteHandler = function (PlaceObj, index) {

    //Infowindow-Popup
    app.NearBy.PlacesService.getDetails(PlaceObj, function (result, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
            alert(status);
            return;
        }

        var address = app.CommonUtils._getAddressComponentForPlace(result);
        app.CommonUtils.infowindow.setContent('<div style="color: darkblue;"><strong>' + result.name + '</strong><br>' + address + "</div>");
        app.CommonUtils.infowindow.open(app.Base.map, app.NearBy.MarkersArray[index]);
    });


    //Routing - Task

    // Directions Request Object Config
    var Request = {};
    Request.origin = new google.maps.LatLng(app.NearBy.latitude, app.NearBy.longitude);
    Request.destination = PlaceObj.geometry.location;
    Request.travelMode = google.maps.TravelMode.DRIVING;

    app.NearBy.DirectionsRenderer.setMap(app.Base.map);
    //app.NearBy.DirectionsRenderer.setPanel(document.getElementById('directions-panel'));

    app.NearBy.DirectionsService.route(Request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            app.NearBy.DirectionsRenderer.setDirections(result);
        }
    });
}

// 1.9 OnClick Handler for Markers
app.NearBy.PlacesResultsMarkerclickHandler = function (e) {

    var indexRes = JSLINQ(app.NearBy.MarkersArray).Where(function (item) { return item.internalPosition == e.latLng; });
    var index = app.NearBy.MarkersArray.indexOf(indexRes.items[0]);

    app.NearBy.MarkersInfoWinAndRouteHandler(app.NearBy.PlacesArray[index], index);
}

// 1.10 Marker Remover Handler
app.NearBy.MarkerRemoveHandler = function (MarkersArray) {

    if (MarkersArray !== undefined) {
        for (var i = 0; i < MarkersArray.length; i++) {
            MarkersArray[i].setMap(null);
        }
    }

}


// 1.11 validation for the user input 
 app.NearBy.Validation = function (arr) {

    var decimal = /^\d+\.\d{0,10}$/;  // regEx test for decimal upto 10 decimal places
    var number = /^-?\d+\.?\d*$/;     // regEx for signed numbers + float as well
    var datacheck1 = (decimal.test(arr[0]) || number.test(arr[0])) && (decimal.test(arr[1]) || number.test(arr[1])) && (decimal.test(arr[3]) || number.test(arr[3]));  // testing all the numeric inputs for their data type
    var datacheck2 = (arr[3] > 0 && arr[3] <= 3); // testing if the radius inpu is > 0 & < 3 ( we are restricting the radial search to 3 km. )

    if (datacheck1 && datacheck2) { return true; }
    else {
        $("#searchErrorMessageDiv").html("Please enter the input properly for processing. For detailed functional description , read the documentation.");
        return false;
    }
}


/** synchronization of given places type with the places_type of google places api
    Reference: (https://developers.google.com/places/supported_types).
    placesTypeSync object is used in syncing the places type in the Radar Search request object.

**/

app.NearBy.placesTypeSync = {
        "ATM":"atm",
        "Bank":"bank",
        "Clinic":"doctor",
        "Hospital":"hospital",
        "Restaurant":"restaurant"
}

// Icons Sync.
app.NearBy.iconSync = {
    "ATM": "atm",
    "Bank": "bank",
    "Clinic": "clinic",
    "Hospital": "hospital",
    "Restaurant": "restaurant"    
}
