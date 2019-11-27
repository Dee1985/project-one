// Select all the input fields with the class name of "search-js"
const destEls = document.querySelectorAll(".search-js");
// Select the submit button
const buttonEl = document.getElementById("button");

// Function that will grab all the input values from the destEls array
function getLocationInputs(){
    for (let i = 0; i < destEls.length; i++) {
        const currentDest = destEls[i].value;
        // Call getBreweries function to get the breweries at the current destination in the array
        getBreweries(currentDest);    
    }
}

// Add event listener to the submit button and when clicked run the getLocationInputs function
buttonEl.addEventListener("click", getLocationInputs);

// Function that will find all the breweries at a certain location by using openBreweryDB's API
function getBreweries(currentLocation) {
    let queryURL = "https://api.openbrewerydb.org/breweries?by_city=" + currentLocation;
    axios.get(queryURL)
    .then(function(response){
        console.log(response.data);
    });       
}

// Problems right now:
// 1. The response is returning cities in Birmingham????
