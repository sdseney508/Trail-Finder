//variables required
var search_history = $('#search-history'); // looks for the div id search history.
var loc_search_history_array = [];
var trail_search_history_array = [];
var search_history_by_location = $('#location-search-history');
var search_history_by_trail = $('#trail-search-history');
var wx_cards = ('#weathercards');
const api_key = 'a927e5d1a4f226a1efed57b2a089721b';
var clear_btn = $('#clear_hist_btn');

clear_btn.on('click', function(){
    localStorage.clear();
    initializePage();
})

$(function () {
    var trail_dialog;
    var trail_name_form;
    var t_name;
    var t_location;
    var trail_form_fields = $([]).add(t_name).add(t_location);
    var location_formfields = $

    function searchTrailName() {
        var t_name;
        var t_location;

        t_name = $('#trailname').val();
        t_location = $("#location").val();

        // alert("Trail name to be searched for is: " + t_name);
        // alert("Location to be searched for is: " + t_location);
        if (t_name == 'Trail Name' || t_name == null) {
            t_name = 'NA';
        }

        // alert("Trail name to be searched for is: " + t_name);

        trail_dialog.dialog("close");
        if (t_location != 'City, State') {
            let format_check = t_location.search(",");
            if (format_check === -1) {
                // alert('The search location must be in City, State format.  Please Try again.');
                return;
            }

            let loc_array = t_location.split(",");
            for (i = 0; i < loc_array.length; i++) {
                loc_array[i] = loc_array[i].trimStart();
            }
            t_location = loc_array.join();
            // console.log(t_location);
        }
        getWeather(t_name, t_location);
    }

    trail_dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Search for Trail": searchTrailName,
            Cancel: function () {
                trail_name_form[0].reset();
                trail_dialog.dialog("close");
            }
        }
    });

    trail_name_form = trail_dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        searchTrailName();
    });

    $('#search_trails_btn').button().on('click', function () {
        trail_dialog.dialog("open");
    });


})

function getWeather(trail_name, t_loc) {
    //first add the city to the search_history)array.  The city always becomes the first in the array, the array is limited to 10 cities, so it
    //pops the last element in the array if the array length ===10.

    //assign the cityname val to a variable so it can be used in the search_history_array below.  Make first letters capital.
    // var temp_cityname = city.val();
    var t_loc = t_loc.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

    let poss_check = false;

    //first check to see if the location is already in the array, if it is, still pull up the search, but dont add it to the array.
    for (t = 0; t < loc_search_history_array.length; t++) {
        if (loc_search_history_array[t] == t_loc) {
            poss_check = true;
        }
    }
    //ignore adding it to the array if it's already there; limits lenght of array to 5
    if (poss_check == false) {
        if (loc_search_history_array != null) {
            if (loc_search_history_array.length === 5) {
                loc_search_history_array.unshift(t_loc);
               loc_search_history_array.pop();
            }
            else {
                loc_search_history_array.unshift(t_loc);
            }
        }
        // this else is here to just add the location to the current null array.
        else {
            loc_search_history_array.push(t_loc);
        }
        //reset the local storage for the search_history_array
        localStorage.setItem('locationsearchhistoryarray', JSON.stringify(loc_search_history_array));
    }

    //now cycle through the search_history_array and create a research button for each prior searched city name.
    //right now trail_search_hisotry_array is null and just a place holder, we still need to see if the API lets you search by Trail name.
    buildHistoryCards(loc_search_history_array, trail_search_history_array);

    //call the build weather card but only with the city name entered in the search box and not the entire search_history_array.
    buildWeatherCards(loc_search_history_array);
}

function initializePage() {
    //initializes the page showing past search history
    $('#trailname').val("");
    $('#location').val("");
    let temp_loc_search_array = JSON.parse(localStorage.getItem('locationsearchhistoryarray'));
    let temp_trail_search_array = JSON.parse(localStorage.getItem('trailsearchhistoryarray'));
    loc_search_history_array = temp_loc_search_array || [];
    trail_search_history_array = temp_trail_search_array || [];

    //rebuild the search history cards
    buildHistoryCards(loc_search_history_array, trail_search_history_array);
}

function buildHistoryCards(loc_hist_array, trail_hist_array) {
    search_history_by_location.empty();
    search_history_by_trail.empty();
    for (i = 0; i < loc_hist_array.length; i++) {
        search_history_by_location.append('<button type="submit" class="button expanded" id="' + loc_hist_array[i] + '">' + loc_hist_array[i] + '</button>');
        //research the wx from prior searches.
        // $('#' + search_history_by_location[i]).on('click', function (event) {
        //     event.preventDefault();
        //     let temp_loc = this.id;
        //     buildWeatherCards(temp_loc);
        // });    
    }
    //only if API supports a lat long for trail location to build wx off trail name
    for (i = 0; i < trail_hist_array.length; i++) {
        search_history_by_trail.append('<button type="submit" class="button" id="' + trail_hist_array[i] + '">' + trail_hist_array[i] + '</button>');
        //research the wx from prior searches.
        // $('#' + s_history_array[i]).on('click', function (event) {
        //     event.preventDefault();
        //     let temp_city_n = this.id;
        //     buildWeatherCards(temp_city_n);
        // });    
    }
}

function buildWeatherCards(t_loc) {
    //clear out old cards and info
    // wx_cards.empty();
    var latitude;
    var longitude;

    debugger;
    var geo_url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + t_loc[0] + ',US&appid=' + api_key;
    console.log(geo_url);
    fetch(geo_url, {
        cache: 'reload',
    })
        .then(function (response) {
            console.log(response.status);
            if (response.status !== 200) {
                console.log(response.status);
                return false;
            }
            return response.json();
        })
        .then(function (data) {
            latitude = data[0].lat;
            longitude = data[0].lon;
            var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + api_key;
            console.log(url);
            //executes a fetch from openweathermap.org.  API key is sdseney508 key and is stored as a const
            fetch(url, {
                cache: 'reload',
            })
                //make sure the response wasnt a 404
                .then(function (response) {
                    if (response.status !== 200) {
                        city_curr_title.append('<h3>City Not Found Please Try Again</h3>');
                        return false;
                    }
                    return response.json();
                })
                .then(function (data) {
                    if (data == false) {
                        return;
                    }
                    //build current wx card title
  
                    //build a for loop to extract the data for the current day (list item 0) and the next 5 days, list 1-5.
                    for (i = 0; i < 5; i++) {
                        var wx_date = Date(data.daily[i].dt);
                        var temp_hi = data.daily[i].temp.max;
                        var temp_low = data.daily[i].temp.min;
                        var winds = data.daily[i].wind_speed;
                        var humidity = data.daily[i].humidity;

                            let day_id = i;
                            let future_wx_cards = $('#day-' + i);
                            // clear prior search results
                            future_wx_cards.empty();
                            // build the cards
                            future_wx_cards.append('<div class="card-divider">' + wx_date + '</div>')
                            // future_wx_cards.append('<div>' + wx_date + '</div>');
                            future_wx_cards.append('<div><img src="http://openweathermap.org/img/wn/' + data.daily[i].weather[0].icon
                                + '@2x.png" alt="WX Icon" class="weather-icon"></div>');
                            future_wx_cards.append('<div>Forecast Hi: ' + temp_hi + '</div>');
                            future_wx_cards.append('<div>Forecast Low: ' + temp_low + '</div>');
                            future_wx_cards.append('<div>Wind: ' + winds + ' MPH</div>');
                            future_wx_cards.append('<div>Humidity: ' + humidity + ' %</div>');
                    }
                })
        });
}

initializePage();

