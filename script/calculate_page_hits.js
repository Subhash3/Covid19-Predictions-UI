HITS_API = "http://40.76.33.143:3000"

var getCurrentDate = () => {
    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    return year + "-" + month + "-" + date
}

var getCurrentTime = () => {
    let date_ob = new Date();

    let hours = date_ob.getHours()
    let minutes = date_ob.getMinutes()
    let seconds = date_ob.getSeconds();

    return hours + ":" + minutes + ":" + seconds
}

var updateHits = async () => {
    currentDate = getCurrentDate()
    currentTime = getCurrentTime()

    data = {
        "date": currentDate,
        "time": currentTime
    }

    response = await fetch(HITS_API, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data),
    })
}

window.addEventListener('load', updateHits)