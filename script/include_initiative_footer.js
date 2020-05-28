var getFooterHtml = async () => {
    console.log("Getting Footer")
    response = await fetch('../initiative_footer.html')
    content = await response.text()
    return content
}

var renderFooter = async () => {
    console.log("Rendering Footer")
    content = await getFooterHtml()
    domObject = new DOMParser()
    doc = domObject.parseFromString(content, 'text/html')
    footerDiv = doc.getElementsByClassName('initiative')[0]
    console.log(footerDiv)
    thisBody = document.getElementsByTagName('body')[0]
    thisBody.append(footerDiv)
}