const col = [
    {
        type: 'dropdown',
        title: 'Loại token',
        width: 120,
        source: [
            {id: 1, name: "YT", text: "1: YT"},
            {id: 2, name: "Tiktok", text: "2: tiktok"}
        ],
        name: "typeToken"
    },
    {
        type: 'text',
        width: 400,
        name: 'token',
        title: 'Token'
    }
];

let mySpreadsheet2 = {};

$(document).ready(function () {
    LoadData();
});

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
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
    if (!manager.length) {
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
            if (result.status == 200) {
                result.Mess.forEach(element => {
                    html += "<tr>";
                    html += "<td>" + element.User + "</td>";
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

function Save() {
    let data = getObjectOnModal();

    if (!data.Manager.length) {
        $.notify("Phiên đăng nhập hết hạn, bạn hãy đăng nhập lại !!!", "warn");
        return;
    }

    if (!data.User.length) {
        $.notify("Nhập tên user !!!", "warn");
        return;
    }

    if (!data.Token.length) {
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
            if (result.status == 200) {
                $.notify("Thành công !!!", "success");
                ClearTextBoxSpecial();

                return;
            }
            else {
                $.notify("Có lỗi xảy ra !!!", "error");
                return;
            }
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

function SaveTokenYt_Tiktok()
{
    let data = filterDataToSave(mySpreadsheet2.getJson());
    console.log("data: ", data);
    
    if(data.length == 0)
    {
        $.notify("Dữ liệu ko hợp lệ !!!", "error");
        return;
    }

    /* Save data to db */
    $.ajax({
        url: "/create_token_yt_tiktok",
        data: JSON.stringify(data),
        type: "POST",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.status == 200) {
                $.notify("Thành công !!!", "success");
                return;
            }

            $.notify("Có lỗi xảy ra !!!", "error");
            return;
        },
        error: function (errormessage) {
            console.log(errormessage.responseText);
        }
    });
}

function getObjectOnModal() {
    return {
        User: $('#txtUserName').val(),
        FanPageName: $('#txtNamePage').val(),
        FanPageLink: $('#txtLinkPage').val(),
        Token: $('#txtToken').val(),
        Note: $('#txtPassword').val(),
        Manager: getCookie("cookiename"),
        StatusToken: 1,
        Cookies: $('#txtCookie').val(),
        TypeToken: $("#cbTypeToken").val(),
        IsPageOwner: $('#cbIsPageOwner').is(":checked") == true ? 1 : 0,
        ServerName: $("#txtServerName").val()
    };
}

function ClearTextBoxSpecial() {
    $('#txtNamePage').val('');
    $('#txtToken').val('');
    $('#txtLinkPage').val('');
    $('#txtLinkPage').val('');
    $('#txtCookie').val('');
    $("#cbTypeToken").val('0');
    $('#cbIsPageOwner').prop('checked', false);
    $("#txtServerName").val('');
}

function ClearFullTextBox() {
    $('#txtUserName').val('');
    $('#txtNamePage').val('');
    $('#txtToken').val('');
    $('#txtPassword').val('');
    $('#txtLinkPage').val('');
    $('#txtCookie').val('');
    $("#cbTypeToken").val('0');
    $('#cbIsPageOwner').prop('checked', false);
    $("#txtServerName").val('');
}

function CloseModal() {
    $('#myModal').modal('hide');
}


function Close() {
    CloseModal();
    ClearFullTextBox();
}

function ShowModalExccel() {
    jexcel.destroy(document.getElementById('spreadsheet3'), false);

    mySpreadsheet2 = jexcel(document.getElementById('spreadsheet3'), {
        minDimensions: [0, 1],
        tableWidth: '100%',
        tableOverflow: true,
        columns: col
    });
}

function filterDataToSave(myExcel) {
    return myExcel.filter(function(item) {
        return (item.token && item.typeToken);
    });
}