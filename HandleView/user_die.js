"use strcit"
let _arrId = [];
let _arrId2 = [];

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
        url: "/getUserDieByManager/" + manager + "/" + UserDie,
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            let html = '';
            let note = "Lấy lại cả token";

            if(result.status === 200){
                let GET_TOKEN_BY_INSTAGRAM = 1;
                let GET_BY_COOKIE = 2;

                result.Mess.forEach(element => {
                    let userName = element.User.toString().replace(/(\r\n|\n|\r)/gm, '');

                    html += '<tr>';
                    html +=     '<td>' + element.User + '</td>';
                    html +=     '<td class="text-center"><input type="checkbox" onclick="GetValueCheckBox(\'' + userName + '\', true, \'' + element.typeToken + '\')"></td>';
                    html +=     '<td class="text-center"><input type="checkbox" onclick="GetValueCheckBox(\'' + userName + '\', false, \'' + element.typeToken + '\')"></td>';
                    html +=     '<td class="text-center">';
                    html +=         '<i style="cursor: pointer;" class="glyphicon glyphicon-pencil" onclick="Edit(\'' + userName + '\')"></i>';
                    html +=     '</td>';
                    
                    if(element.typeToken.includes(`${GET_TOKEN_BY_INSTAGRAM.toString()}`) || element.typeToken.includes(`${GET_BY_COOKIE.toString()}`)){
                        html +=  '<td>' + note + '</td>';
                    }
                    else{
                        html +=  '<td></td>';
                    }

                    html += '<td>' + element.ServerName + '</td>';
                    html += '</tr>';
                });
            }

            // Show data on table
            $('#bodyTable').html(html);
            $('#example').DataTable({
                "searching": false,
                "ordering": false
            });
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function Edit(userName){
    debugger;
    $('#txtUserName').val(userName);
    $('#txtPassword').val('');
    $('#myModal').modal('show');
}

function Close(){
    $('#myModal').modal('hide');
}

function ChangePassword(){
    let data = {
        UserName: $('#txtUserName').val(),
        Password: $('#txtPassword').val()
    };

    $.ajax({
        url: "/updatePasswordByUsername",
        type: "POST",
        data: JSON.stringify(data),
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if(result.status == 200){
                $.notify("Thành công !!!", "success");
                Close();
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

function GetValueCheckBox(values, option, typeToken){
    let temp = {
        userName: values,
        typeToken: typeToken
    };

    if(option){
        if(_arrId.some(el => el.userName === temp.userName)){
            _arrId = _arrId.filter(function(el) { 
                return el.userName != temp.userName; 
            });
        }
        else{
            _arrId.push(temp);
        }
    }
    else{
        if(_arrId2.some(el => el.userName === temp.userName)){
            _arrId2 = _arrId2.filter(function(el) { 
                return el.userName != temp.userName; 
            });
        }
        else{
            _arrId2.push(temp);
        }
    }
}

function UpdateStatusTokenOpened(){
    return new Promise((resolve, reject) => {
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
                   resolve(true);
                }
                else{
                    resolve(false);
                }
            },
            error: function (errormessage) {
                reject(false);
            }
        });
    });
}

function UpdateStatusTokenBlocked(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/updateStatusToken/" + UserDieForever,
            data: JSON.stringify({
                mess: _arrId2
            }),
            type: "POST",
            cache: false,
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                if(result.status == 200){
                    resolve(true);
                }
                else{
                    resolve(false);
                }
            },
            error: function (errormessage) {
                reject(false);
            }
        });
    });
}

async function Save(){
    if(!_arrId.length && !_arrId2.length)
    {
        $.notify("Xin mời bạn chọn 1 phần tử !!!", "warn");
        return;
    }

    let arrSuccess = [true, true];
    if (_arrId.length > 0) {
        arrSuccess[0] = await UpdateStatusTokenOpened();
    }

    if(_arrId2.length > 0){
        arrSuccess[1] = await UpdateStatusTokenBlocked();
    }

    if(arrSuccess[0] || arrSuccess[1]){
        $.notify("Thành công !!!", "success");
    }
    else{
        $.notify("Thất bại !!!", "error");
    }

    /* Free memory */
    _arrId.length = 0;
    _arrId2.length = 0;
    LoadData();
}