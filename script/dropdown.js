async function getDistrictWisePopulation() {
    FILENAME = "../JSON_files/district_wise_population_india.json"

    response = await fetch(FILENAME)
    jsonData = await response.json()
    // console.log(jsonData)
    return jsonData
}

var dropMenuDown = (event) => {
    dropDownIcon = event.target
    dropDownIconSpan = dropDownIcon.parentElement
    dropDownListHeader = dropDownIconSpan.parentElement
    dropDownList = dropDownListHeader.parentElement
    dropDownListItems = dropDownList.children[1]

    $(dropDownListItems).toggle("slow")
    $(dropDownIconSpan).toggleClass('icon_clicked')
}

var districtClickHandler = (event) => {
    targetElement = event.target
    tagName = targetElement.tagName.toLowerCase()
    mainDropdownLost = targetElement.parentElement.parentElement
    itsHeader = mainDropdownLost.children[0]
    itsStateName = itsHeader.children[0].childNodes[0].nodeValue
    itsDistrictName = targetElement.childNodes[0].nodeValue
    console.log(itsStateName, itsDistrictName)

    iframe = window.frames["indiaMapFrame"]
    iframeDoc = iframe.contentDocument
    links = iframeDoc.getElementsByTagName('a')

    for (index in links) {
        link = links[index]
        linkPath = link.children[0]
        linkStateName = linkPath.attributes["title"].nodeValue
        if (linkStateName == itsStateName) {
            $(linkPath).mouseover()
            // $(link).click()
            iframeDoc.location.pathname = "states/" + link.href.baseVal
            break
        }
    }
}

var stateClickHandler = (event) => {
    targetElement = event.target
    tagName = targetElement.tagName.toLowerCase()

    if (tagName === 'i') {
        return false
    }

    span = targetElement
    if (tagName == 'div') {
        span = targetElement.children[0]
    }
    stateName = span.childNodes[0].nodeValue
    console.log(stateName)

    iframe = window.frames["indiaMapFrame"]
    iframeDoc = iframe.contentDocument
    links = iframeDoc.getElementsByTagName('a')

    for (index in links) {
        link = links[index]
        linkPath = link.children[0]
        linkStateName = linkPath.attributes["title"].nodeValue
        if (linkStateName == stateName) {
            $(linkPath).mouseover()
            break
        }
    }
}

ICON_HTML = '<i class="fa fa-arrow-circle-down"></i>'
dropdown_container = document.getElementById("dropdown_container")

jsonData = getDistrictWisePopulation()
jsonData.then(district_wise_population => {
    for (state in district_wise_population) {
        dropdownListElement = document.createElement('div')
        dropdownListElement.setAttribute('class', 'dropdown-list')
        dropdownHeaderElement = document.createElement('div')
        dropdownHeaderElement.setAttribute('class', 'dropdown-list__header')
        dropdownHeaderElement.addEventListener('click', stateClickHandler)

        stateNameElement = document.createElement('span')
        stateNameElement.innerText = state
        iconElement = document.createElement('span')
        iconElement.setAttribute('class', 'icon')
        iconElement.innerHTML = ICON_HTML

        iconElement.addEventListener('click', dropMenuDown)

        dropdownHeaderElement.appendChild(stateNameElement)
        dropdownHeaderElement.appendChild(iconElement)

        listOfDistricts = document.createElement('div')
        listOfDistricts.setAttribute('class', 'dropdown-list__items')

        allDistrictObjects = district_wise_population[state]["districts"]
        allDistrictObjects.forEach(districtObject => {
            districtName = districtObject["districtName"]

            districtElement = document.createElement('div')
            districtElement.setAttribute('class', 'dropdown-list__item')
            districtElement.innerText = districtName

            districtElement.addEventListener('click', districtClickHandler)

            listOfDistricts.appendChild(districtElement)
        })

        dropdownListElement.appendChild(dropdownHeaderElement)
        dropdownListElement.appendChild(listOfDistricts)

        dropdown_container.appendChild(dropdownListElement)
    }
    totalAsState = dropdown_container.lastChild
    dropdown_container.removeChild(totalAsState)
})