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
                result.Mess.forEach(element => {
                    html += '<tr>';
                    html +=     '<td>' + element.FanPageName + '</td>';
                    html +=     '<td>';
                    html +=         '<a href="' + element.Link + '" target="_blank">' + element.Link + '</a>';
                    html +=     '</td>';
                    html +=     '<td>' + element.UserName + '</td>';
                    html +=     '<td>' + element.TotalAdmin + '</td>';
                    html +=     '<td class="text-center">';
                    html +=         '<i style="cursor: pointer;" class="glyphicon glyphicon-eye-open" onclick="ShowAdminByNamePage(\'' + element.FanPageName + '\')"></i>';
                    html +=     '</td>';
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

function ShowAdminByNamePage(namePage){
    if(namePage){
        $.ajax({
            url: "/getListAdminByPage/" + namePage,
            type: "GET",
            cache: false,
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                if(result.status === 200){
                    ShowDataOnModal(result.Mess);
                    OpenModal();
                }
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
    }
    else{
        $.notify("Không tìm thấy kết quả!!!", "warn");
        return;
    }
}

function ShowDataOnModal(listData){
    let html = ``;
    let countRow = listData.length;

    if(countRow > 0){
        for(let i = 0; i < countRow; ++i){
            html += `<div class='form-group'>`;
            html +=     `<label class='control-label col-sm-2'>Admin ${i + 1}:</label>`;
            html +=     `<div class='col-sm-10'>`;
            html +=         `<input class='form-control' value="${listData[i].User}">`;
            html +=     `</div>`;
            html += `</div>`;
        }
    }

    $('#dynamicForm').html(html);
}

function Close(){
    $('#myModal').modal('hide');
}

function OpenModal(){
    $('#myModal').modal('show');
}

