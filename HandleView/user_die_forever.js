"use strcit"
let _arrId = [];

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

function LoadData() {
    if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
    }

    $('#bodyTable').empty();
    let manager = getCookie("cookiename");
    if(!manager.length){
        $.notify("Hết phiên đăng nhập, bạn hãy đăng nhập lại !!!", "warn");
        return;
    }

    $.ajax({
        url: "/getUserDieByManager/" + manager + "/" + UserDieForever,
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            let html = "";
            if(result.status == 200){
                result.Mess.forEach(element => {
                    let userName = element.User.toString().replace(/(\r\n|\n|\r)/gm, '');

                    html += "<tr>";
                    html +=     "<td>" + element.User + "</td>";
                    html +=     '<td class="text-center"><input type="checkbox" onclick="GetValueCheckBox(\'' + userName + '\',\'' + element.typeToken + '\')"></td>';
                    html += '</tr>';
                });
            }

            // Show data on table
            $('#bodyTable').html(html);
            $('#example').DataTable({
                "ordering": false
            });
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function GetValueCheckBox(values, typeToken){
    let temp = {
        userName: values,
        typeToken: typeToken
    };

    if(_arrId.some(el => el.userName === temp.userName)){
        _arrId = _arrId.filter(function(el) { 
            return el.userName != temp.userName; 
        });
    }
    else{
        _arrId.push(temp);
    }
}

function Save(){
    $.ajax({
        url: "/updateStatusToken/" + UserLive,
        data: JSON.stringify({
            mess: _arrId
        }),
        type: "POST",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if(result.status == 200){
                $.notify("Thành công !!!", "success");
                LoadData();
            }
            else{
                $.notify("Thất bại !!!", "error");
            }
        },
        error: function (errormessage) {
            $.notify("Thất bại !!!", "error");
        }
    });
}