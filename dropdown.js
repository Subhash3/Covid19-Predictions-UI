$('.dropdown-list .icon').click((event) => {
    dropDownIcon = event.target
    dropDownIconSpan = $(dropDownIcon).parent()
    dropDownListHeader = dropDownIconSpan.parent()
    dropDownList = $(dropDownListHeader).parent()
    dropDownListItems = $(dropDownList).children()[1]

    $(dropDownListItems).toggle("slow")
    $(dropDownIconSpan).toggleClass('icon_clicked')
})