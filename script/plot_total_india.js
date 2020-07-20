$(document).ready(() => {
    plotTotalIndia()
})

const PAST_VALUES_API = "http://127.0.0.1:3000/countries/India/past"
const PREDICTION_API_URL = "http://127.0.0.1:3000/countries/India/predict"

const getPastIndiaData = async () => {
    let response = await fetch(PAST_VALUES_API)
    let jsonData = await response.json()
    return jsonData
}

const getPredictIndiaData = async () => {
    let response = await fetch(PREDICTION_API_URL)
    let jsonData = await response.json()
    return jsonData
}

const plotTotalIndia = () => {
    let pastDataPromise = getPastIndiaData()
    let preidctionsPromise = getPredictIndiaData()

    Promise.all([pastDataPromise, preidctionsPromise]).then(data => {
        let pastData = data[0]
        let predictions = data[1]
        console.log(predictions)

        let prev_dates = []
        let prev_active = []
        let prev_deaths = []
        let prev_confirmed = []
        pastData.forEach(day_object => {
            prev_dates.push(day_object["date"])
            prev_active.push(day_object["active"])
            prev_deaths.push(day_object["deaths"])
            prev_confirmed.push(day_object["confirmed"])
        });
        let prev = [prev_dates, prev_active, prev_deaths, prev_confirmed]

        let next_dates = []
        let next_active = []
        let next_deaths = []
        let next_confirmed = []
        predictions["predictions"].forEach(day_object => {
            next_dates.push(day_object["date"])
            next_deaths.push(day_object["deaths"])
            next_active.push(day_object["active"])
            next_confirmed.push(day_object["confirmed"])
        })
        // prev = prevDistricts(state, district)
        let next = [next_dates, next_active, next_deaths, next_confirmed]

        $('#achart-cont').css('filter', 'opacity(100%)');
        $('#dchart-cont').css('filter', 'opacity(100%)');
        $('#atableP').css('filter', 'opacity(100%)');
        $('#dtableP').css('filter', 'opacity(100%)');

        placeName = "Whole India"
        drawChart(placeName, prev, next)
    })
}