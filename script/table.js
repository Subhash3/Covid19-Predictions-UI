function createTable(columns, tableHeadId) {

    window.parent.$(tableHeadId).append('<tr>');
    window.parent.$(tableHeadId).append('<th>' + columns[0] + '</th>');
    window.parent.$(tableHeadId).append('<th>' + columns[1] + '</th>');
    window.parent.$(tableHeadId).append('<th>' + columns[2] + '</th>');
    window.parent.$(tableHeadId).append('</tr>');
}

function fillTable(tableData, tableBodyId) {
    dates = tableData[0]
    col2 = tableData[1]
    col3 = tableData[2]
    var i = 0
    for (i = 0; i < dates.length; i++) {

        window.parent.$(tableBodyId).append('<tr>');
        window.parent.$(tableBodyId).append('<td>' + dates[i] + '</td>');
        window.parent.$(tableBodyId).append('<td>' + col2[i] + '</td>');
        window.parent.$(tableBodyId).append('<td>' + col3[i] + '</td>');
        window.parent.$(tableBodyId).append('</tr>');
        // console.log(dates[i])
    }
}
function clearTable(tableBodyId, tableHeadId) {
    window.parent.$(tableHeadId).html('')
    window.parent.$(tableBodyId).html('')
}

// p = ["2020-05-20", "2020-05-21", "2020-05-22", "2020-05-23", "2020-05-24", "2020-05-25", "2020-05-26"]
// q = [55, 92, 108, 123, 139, 155, 179]
// q = [55, 92, 108, 123, 139, 155, 179]
// createTable(['Date', 'Active', 'Deceased'], '#tableH')
// fillTable([p, q, q], '#tableP')
// clearTable('#tableH', '#tableP')