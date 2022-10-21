$(document).ready(function () {
    LoadData();
});

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }

      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return "";
}

function LoadData(){
    let manager = getCookie("cookiename");
    if(!manager.length){
        $.notify("Hết phiên đăng nhập, bạn hãy đăng nhập lại !!!", "warn");
        return;
    }

    if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
    }

    $('#bodyTable').empty();

    $.ajax({
        url: "/getListToltalAdminOfPage",
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            let html = '';
            if(result.status == 200){
                console.log("result: ", result);
                result.Mess.forEach(element => {
                    html += '<tr>';
                    html +=     '<td>' + element.FanPageName + '</td>';
                    html +=     '<td>';
                    html +=         '<a href="' + element.Link + '">' + element.Link + '</a>';
                    html +=     '</td>';
                    html +=     '<td>' + element.UserName + '</td>';
                    html +=     '<td>' + element.TotalAdmin + '</td>';
                    html += '</tr>';
                });
            }

            // Show data on table
            $('#bodyTable').html(html);
            $('#example').DataTable({
                "searching": true,
                "ordering": false
            });
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}