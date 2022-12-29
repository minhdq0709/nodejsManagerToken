function LoadDataForChartPersonal(manager) {
    $.ajax({
        url: `/GetTokenByManager/${manager}`,
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.status == 200) {
                let xValues = ["Token tạo mới", "Tổng số token"];
                let yValues = [];

                if(result.Mess.length == 1){
                    yValues[0] = result.Mess[0].tokenInMonth;
                    yValues[1] = result.Mess[0].tokenInMonth;
                }
                else if(result.Mess.length == 2){
                    yValues[0] = result.Mess[0].tokenInMonth;
                    yValues[1] = result.Mess[1].tokenInMonth;
                }

                let barColors = ["green", "blue"];

                new Chart("myChartPersonal", {
                    type: "bar",
                    data: {
                        labels: xValues,
                        datasets: [{
                            backgroundColor: barColors,
                            data: yValues,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        },
                        title: {
                            display: true,
                            text: `Thống kê T${new Date().getMonth() + 1}`
                        },
                        legend: {
                            display: false
                        },
                        animation: {
                            onComplete: function () {
                                let chartInstance = this.chart;
                                let ctx = chartInstance.ctx;

                                ctx.font = Chart.helpers.fontString(
                                    Chart.defaults.global.defaultFontSize,
                                    Chart.defaults.global.defaultFontStyle,
                                    Chart.defaults.global.defaultFontFamily);

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';

                                this.data.datasets.forEach(function (dataset, i) {
                                    let meta = chartInstance.controller.getDatasetMeta(i);

                                    meta.data.forEach(function (bar, index) {
                                        let data = dataset.data[index];
                                        ctx.fillText(data, bar._model.x, bar._model.y);
                                    });
                                });
                            }
                        }
                    }
                });

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

function LoadDataForChartTeamCrawler() {
    $.ajax({
        url: "/StatisticToken",
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.status == 200) {
                let xValues = ["Tổng số token", "Token sống", "User die", "Lấy lại token"];
                let yValues = [];
                let totalToken = 0;
                
                if(result.Mess.length != 0){
                    result.Mess.forEach(element => {
                        totalToken += element.total_token;
                        
                        if(element.StatusToken == 1){
                            yValues[1] = element.total_token;
                        }

                        else if(element.StatusToken == 100){
                            yValues[2] = element.total_token;
                        }

                        else if(element.StatusToken == 101){
                            yValues[3] = element.total_token;
                        }
                    });
                }

                yValues[0] = totalToken;
                let barColors = ["purple", "blue", "red", "green"];

                new Chart("myChartTeamCrawler", {
                    type: "bar",
                    data: {
                        labels: xValues,
                        datasets: [{
                            backgroundColor: barColors,
                            data: yValues,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        },
                        title: {
                            display: true,
                            text: "Tổng quan"
                        },
                        legend: {
                            display: false
                        },
                        animation: {
                            duration: 1,
                            onComplete: function () {
                                let chartInstance = this.chart;
                                let ctx = chartInstance.ctx;

                                ctx.font = Chart.helpers.fontString(
                                    Chart.defaults.global.defaultFontSize,
                                    Chart.defaults.global.defaultFontStyle,
                                    Chart.defaults.global.defaultFontFamily);

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';

                                this.data.datasets.forEach(function (dataset, i) {
                                    let meta = chartInstance.controller.getDatasetMeta(i);

                                    meta.data.forEach(function (bar, index) {
                                        let data = dataset.data[index];
                                        ctx.fillText(data, bar._model.x, bar._model.y);
                                    });
                                });
                            }
                        }
                    }
                });

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

function LoadStatusTokenByManager(manager) {
    $.ajax({
        url: `/StatisticTokenByManager/${manager}`,
        type: "GET",
        cache: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.status == 200) {
                if(result.Mess.length){
                    let totalTokenBymanager = 0;

                    result.Mess.forEach(element => {
                        if(element.StatusToken == 1){
                            $('#txtUserLive').text(`${element.token}`);
                            totalTokenBymanager += element.token;
                        }

                        else if(element.StatusToken == 100){
                            $('#txtUserDie').text(`${element.token}`);
                            totalTokenBymanager += element.token;
                        }

                        else if(element.StatusToken == 101){
                            $('#txtChangePassword').text(`${element.token}`);
                            totalTokenBymanager += element.token;
                        }
                    });

                    $('#txtTotalToken').text(`${totalTokenBymanager}`);
                }
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

$(document).ready(function () {
    LoadDataForChartPersonal(getCookie("cookiename"));
    LoadDataForChartTeamCrawler();
    LoadStatusTokenByManager(getCookie("cookiename"))
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
