// Select all the input fields with the class name of "search-js"
const destEls = document.querySelectorAll(".search-js");
// Select the submit button
const buttonEl = document.getElementById("button");
const mapEl = document.getElementById("map-img");
const stateSymbols = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const stateNames = ["alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new_hampshire","new_jersey","new_york","north_carolina","north_dakota","ohio","oklahoma","oregon","pennsylvania","rhode_island","south_carolina","south_dakota","tennessee","texas","utah","vermont","virginia","washington","west_virginia","wisconsin","wyoming"];
const breweryDivEl = document.getElementById("brewery-container");
const directionsDivEl = document.getElementById("directions-container");


// Function transforms state symbol returned by mapquest to state name understandable by brewery API
function convertState(stateAbbv) {
    return stateNames[stateSymbols.indexOf(stateAbbv)];
}

// Function that will grab all the input values from the destEls array
function getLocationInputs(){
    clearBreweryList();
    let locationArray = [];
    for (let i = 0; i < destEls.length; i++) {
        const currentDest = destEls[i].value;
        if (currentDest !== "") {
            // Extract city name from user input and use in brewery get request
            let queryURL = "http://www.mapquestapi.com/search/v2/radius?key=QE84xF6fPwGPtqLDtyk7AmK1dcKhwF5g&maxMatches=1&origin=" + currentDest;
            axios.get(queryURL)
            .then(function(response) {
                // console.log(response);
                const cityState = [response.data.origin.adminArea5,convertState(response.data.origin.adminArea3)];
                // Call getBreweries function to get the breweries at the current destination in the array
                getBreweries(cityState); 
            })
          

            locationArray.push(currentDest);
        } 
    }
    getRoute(locationArray);
}

// Add event listener to the submit button and when clicked run the getLocationInputs function
buttonEl.addEventListener("click", getLocationInputs);

// Function that will find all the breweries at a certain location by using openBreweryDB's API
function getBreweries(currentLocation) {
    const city = currentLocation[0];
    const state = currentLocation[1];
    let queryURL = "https://api.openbrewerydb.org/breweries?by_city=" + city + "&by_state=" + state;
    axios.get(queryURL)
    .then(function(response){
        console.log(response.data);
        for (let i = 0; i < response.data.length; i++) {
            // console.log(response.data[i]);
            // Create a new div with a class of "level"
            const newDiv = document.createElement("div");
            newDiv.classList.add("level");
            // Create a new a tag with innerHTML of whatever Brewery name the loop is currently on
            const breweryNameTag = document.createElement("a");
            breweryNameTag.innerHTML = response.data[i].name;
            // Add an href attribute onto the a tag with the link leading to the brewery's website
            breweryNameTag.setAttribute("href", response.data[i].website_url);
            breweryNameTag.setAttribute("target", "_blank");
            // Add a styling class onto the A tag
            breweryNameTag.classList.add("brewery-link");
            // Add new a tag onto the new div with a class of level
            newDiv.append(breweryNameTag);
            // Create new p tage that will contain all the location and contact information about each brewery
            const informationTag = document.createElement("p");
            informationTag.classList.add("brewery-info");
            // Add information to display to the p tag
            informationTag.innerHTML = response.data[i].city + ", " + response.data[i].state;
            // Add the p tag to the new div
            newDiv.append(informationTag);
            // Add new level div to the div with an id of brewery-container
            breweryDivEl.append(newDiv);
        }
    });       
}

function clearBreweryList(){
    while(breweryDivEl.firstChild){
        breweryDivEl.removeChild(breweryDivEl.firstChild);
    }
}


function getRoute(locations) {
    let locationString = "";
    for (let i=0; i<locations.length; i++) {
        locationString = locationString + "'" + locations[i] + "'";
        if (i<locations.length -1) {
            locationString = locationString + ",";
        }
    }
    // Remove spaces from locations for use in query URL
    locationString = locationString.replace(/\s+/g, '');
    const queryURL = "https://www.mapquestapi.com/directions/v2/optimizedroute?key=QE84xF6fPwGPtqLDtyk7AmK1dcKhwF5g&json={'locations':[" + locationString + "]}";
    axios.get(queryURL)
    .then(function(response) {
        console.log(response);
        const mapURL = "https://www.mapquestapi.com/staticmap/v5/map?key=QE84xF6fPwGPtqLDtyk7AmK1dcKhwF5g&session=" + response.data.route.sessionId;
        mapEl.setAttribute("src",mapURL);
        directionsDivEl.innerHTML = "";
        for (let i=0; i<response.data.route.legs.length; i++) {
            for (let j=0; j<response.data.route.legs[i].maneuvers.length; j++) {
                const directionEl = document.createElement("div");
                directionEl.setAttribute("class","control");
                const textEl = document.createElement("textarea");
                textEl.setAttribute("class","textarea mt-2");
                textEl.setAttribute("readonly",true);
                textEl.innerHTML = response.data.route.legs[i].maneuvers[j].narrative;
                textEl.addEventListener("click", function() {
                    mapEl.setAttribute("src",response.data.route.legs[i].maneuvers[j].mapUrl)
                });
                directionEl.append(textEl);
                directionsDivEl.append(directionEl);
            }
        }
    });
}
