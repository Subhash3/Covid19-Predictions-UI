var getMenuHtml = async () => {
    console.log("Getting menu")
    response = await fetch('../menu.html')
    content = await response.text()
    return content
}

var renderMenu = async () => {
    console.log("Rendering menu")
    content = await getMenuHtml()
    domObject = new DOMParser()
    doc = domObject.parseFromString(content, 'text/html')
    menuDiv = doc.getElementsByClassName('menu')[0]
    // console.log(menuDiv)
    thisBody = document.getElementsByTagName('body')[0]
    thisBody.prepend(menuDiv)
}

window.onload = () => {
    renderMenu()
}