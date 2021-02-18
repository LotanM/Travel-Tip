export const weatherService = {
    // onGetWeather,
    renderWeatherWidget
}

// let lat = 32.073582;
// let lon = 34.788052;
const W_KEY = '6c53975efc59be8a72b725abf375b7d4'
// const WEATHER_BASE_URL = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${W_KEY}`



// function getWeather(cb) {
//     const xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
//             let info = JSON.parse(xhr.responseText);
//             cb(info)
//         }
//     }
//     xhr.open("GET", WEATHER_BASE_URL, true);
//     xhr.send();
// }

// function onGetWeather() {
//     getWeather(renderWeather)
// }

function renderWeather(weatherObj) {
    const weatherInfo = weatherObj
    let weatherStr = JSON.stringify(weatherInfo)
    console.log(weatherInfo);
    // document.querySelector('.weather-container').innerHTML = weatherStr
}


function renderWeatherWidget(cityIDX) {
    window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];
    window.myWidgetParam.push({
        id: 12,
        cityid:cityIDX,
        appid: '6c53975efc59be8a72b725abf375b7d4',
        units: 'metric',
        containerid: 'openweathermap-widget-12',
    });
    (function () {
        var script = document.createElement('script');
        script.async = true; script.charset = "utf-8";
        script.src = "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    })()

}