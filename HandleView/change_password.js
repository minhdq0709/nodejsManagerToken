"use strcit"

$(document).ready(function () {
    LoadData();
});

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

<<<<<<< HEAD
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
=======
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
>>>>>>> 5b6bc336abb2bb5a20a1572baab134da691712b0

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
                    html += "<tr>";
                    html +=     "<td>" + element.User + "</td>";
                    html +=     "<td class='text-center'>";
                    html +=         "<i style='cursor: pointer;' class='glyphicon glyphicon-pencil' onclick=Edit('" + element.User + "')></i>";
                    html +=     "</td>";
                    html += "</tr>";
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
            console.log("result: ", result);
            if(result.status == 200){
                if(!result.Mess.length){
                    $.notify("Token ko tồn tại !!!", "warn");
                    return;
                }

                // ShowDataToTextBox(result.Mess[0]);
                 OpenModal();
            }
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function ShowDataToTextBox(data){
    $("#txtUserName").val(data.User);
    $("#txtPassword").val(data.Note);
    $("#txtNamePage").val(data.FanPageName);
    $("#txtToken").val(data.Token);
    $("#txtId").val(data.Id);
}

function Save(){
    let data = GetDataOnModal();
    if(!data.Token.length){
        $.notify("Xin mời nhập lại token !!!", "warn");
        return;
    }

    $.ajax({
        url: "/updateTokenById",
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
    return {
        Token: $('#txtToken').val(),
        Id: $('#txtId').val(),
        StatusToken: 1
    };
}

function Close(){
    ClearFullTextBox();
    CloseModal();
}

function ClearFullTextBox(){
    $('#txtUserName').val('');
    $('#txtNamePage').val('');
    $('#txtToken').val('');
    $('#txtPassword').val('');
    $("#txtId").val('');
}

function CloseModal(){
    $('#myModal').modal('hide');
}

function OpenModal(){
    $('#myModal').modal('show');
}
