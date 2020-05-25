STATES_AND_DISTIRCTS_FILE = "./script/district_wise_population_india.json"

async function getStatesAndDistricts() {
    response = await fetch(STATES_AND_DISTIRCTS_FILE)
    jsonData = await response.json()
    console.log(jsonData);
    for (state in jsonData) {
        stateObject = jsonData[state]
        allDistrictObjects = stateObject["districts"]
        // console.log(allDistricts);
        allDistrictObjects.forEach(districtObject => {
            console.log(districtObject["districtName"]);
        })
    }
}

getStatesAndDistricts()