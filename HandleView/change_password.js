"use strcit"
let _arrId = [];

$(document).ready(function () {
    LoadData();
});

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for(let i = 0; i < ca.length; i++) {
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
    /* Clear table */
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
        url: "/getUserChangePasswordByManager/" + manager,
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            let html = "";
            if(result.status == 200){
                result.Mess.forEach(element => {
                    let userName = element.User.toString().replace(/(\r\n|\n|\r)/gm, '');

                    html += '<tr>';
                    html +=     '<td>' + element.User + '</td>';
                    html +=     '<td>' + element.ServerName + '</td>';
                    html +=     '<td class=\'text-center\'>';
                    html +=         '<i style=\'cursor: pointer;\' class=\'glyphicon glyphicon-pencil\' onclick=Edit(\'' + userName + '\')></i>';
                    html +=     '</td>';
                    html +=     '<td class="text-center"><input type="checkbox" onclick="GetValueCheckBox(\'' + userName + '\', true)"></td>';
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

function Edit(userName){
    $.ajax({
        url: "/GetTokenByUser/" + userName,
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if(result.status == 200){
                if(!result.Mess.length){
                    $.notify("Token ko tồn tại !!!", "warn");
                    return;
                }

                ShowDataToTextBox(result.Mess, userName);
                OpenModal();
            }
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function ShowDataToTextBox(data, userName){
    let html = ``;
    let countRow = data.length;
    $("#txtUserName").val(userName);
    $("#txtNumberRow").val(countRow);

    if(countRow > 0){
        for(let i = 0; i < countRow; ++i){
            html += `<div class='form-group'>`
            html +=     `<label class='control-label col-sm-4 left-style' id='lbNamePage'>${data[i].FanPageName}:</label>`;
            html +=     `<div class='col-sm-8'>`;
            html +=         `<input id='txtIdToken${i}' style='display: none;' value='${data[i].id}'>`;
            
            if(data[i].TypeToken === 2){
                html +=     `<div style="display: flex; justify-content: space-between;">`;
                html +=         `<input class="form-control mr-3" id="txtToken${i}" style="width: 49%;" placeholder="Nhập token">`;
                html +=          `<input class="form-control" id="txtCookie${i}" style="width: 49%;" placeholder="Nhập cookie">`;
                html +=     `</div>`;
            }
            else{
                html +=     `<input class="form-control mr-3" id="txtToken${i}" style="width: 100%;">`;
            }
            html +=     `</div>`;
            html += `</div>`;
        }
    }

    $('#dynamicForm').html(html);
}

function Save(){
    let data = GetDataOnModal();

    $.ajax({
        url: "/updateListToken",
        data: JSON.stringify(data),
        type: "POST",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
           if(result.status == 200){
                $.notify("Thành công !!!", "success");
                CloseModal();
                LoadData();
           }
           else{
                $.notify("Có lỗi xảy ra !!!", "error");
           }
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function GetDataOnModal(){
    let arrData = [];
    let rowCount = $("#txtNumberRow").val();

    for(let i = 0; i < rowCount; ++i){
        arrData.push({
            Token: $('#txtToken' + i).val(),
            Id: +$('#txtIdToken' + i).val(),
            Cookie: $('#txtCookie' + i).val() || ""
        });
    }

    return arrData;
}

function Close(){
    CloseModal();
}

function CloseModal(){
    $('#myModal').modal('hide');
}

function OpenModal(){
    $('#myModal').modal('show');
}

function GetValueCheckBox(values){
    let temp = {
        userName: values
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

function Save1(){
    if(!_arrId.length){
        $.notify("Bạn chưa chọn user nào !!!", "warn");
        return;
    }

    $.ajax({
        url: "/updateStatusToken/" + UserDieForever,
        data: JSON.stringify({
            mess: _arrId
        }),
        type: "POST",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.status != 200) {
                $.notify("Có lỗi xảy ra !!!", "error");
                return;
            }

            $.notify("Thành công !!!", "success");
            LoadData();
        },
        error: function (errormessage) {
        }
    });

    /* Free memory */
    _arrId.length = 0;
}


