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
        url: "/getUserDieByManager/" + manager + "/" + UserLive,
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

function Save(){
    let data = getObjectOnModal();

    if(!data.Manager.length){
        $.notify("Phiên đăng nhập hết hạn, bạn hãy đăng nhập lại !!!", "warn");
        return;
    }

    if(!data.User.length){
        $.notify("Nhập tên user !!!", "warn");
        return;
    }

    if(!data.FanPageName.length){
        $.notify("Nhập tên fanpage !!!", "warn");
        return;
    }

    if(!data.FanPageLink.length){
        $.notify("Nhập link fanpage !!!", "warn");
        return;
    }

    if(!data.Token.length){
        $.notify("Nhập token !!!", "warn");
        return;
    }

    /* Save data to db */
    $.ajax({
        url: "/create_token",
        data: JSON.stringify(data),
        type: "POST",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
           if(result.status == 200){
                $.notify("Thành công !!!", "success");
                Close();

                return;
           }
           else{
                $.notify("Có lỗi xảy ra !!!", "error");
                return;
           }
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function Close(){
    ClearTextBoxSpecial();
    CloseModal();
}

function getObjectOnModal(){
    return {
        User: $('#txtUserName').val(),
        FanPageName: $('#txtNamePage').val(),
        FanPageLink: $('#txtLinkPage').val(),
        Token: $('#txtToken').val(),
        Note: $('#txtPassword').val(),
        Manager: getCookie("cookiename"),
        StatusToken: 1
    };
}

function ClearTextBoxSpecial(){
    $('#txtNamePage').val('');
    $('#txtToken').val('');
}

function ClearFullTextBox(){
    $('#txtUserName').val('');
    $('#txtNamePage').val('');
    $('#txtToken').val('');
    $('#txtPassword').val('');
}

function CloseModal(){
    $('#myModal').modal('hide');
}


