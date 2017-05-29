// Quan Dao Dong
var windSpeed = [];
var temperature = [];
var dewLimit = [];
var categories = [];
var stationName = '';

$(document).ready(function() {
	load();
});
$(document).on(function() {
	checkErrors();
});
// Clone to local folder and get the file
function loadJSON(file, callback) {   
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', file, true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == 200) {
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}

// Load the json file which contain all station numbers and names
function load() {
	return loadJSON('python/jsondata.json', function(response) {

		var stations = JSON.parse(response);
		var stationText = '';
		var dataArray = [];
		for (number in stations) {
			var word = stations[number];
		 	dataArray.push({number: parseInt(number), word: word});
		}
		dataArray.sort(function(a, b){
			if (a.word.toLowerCase() < b.word.toLowerCase()) return -1;
			if (b.word.toLowerCase() < a.word.toLowerCase()) return 1;
			return 0;
		});
		for (var key in dataArray){
			stationText += "<li role='presentation'><a id='f" + dataArray[key].number
							+ "' role='menuitem' tabindex='-1'>" + dataArray[key].word + "</a></li>";
		}

		document.getElementById('stations').innerHTML = stationText;
	});
}

// Handler click on stations drop down menu
$(document).on('click', '#stations > li > a', function() {
	stationName = $(this).text();
	document.getElementById('selectedStation').innerHTML = stationName;
	var stationNumber = $(this)[0].id;

	// show all values for checkboxes
	$('#dewlimit').attr('checked', true);
	$('#temperature').attr('checked', true);
	$('#windspeed').attr('checked', true);
	$('#checkboxes').show();
	getStationResult(stationNumber.slice(1, stationNumber.length));
});

// Get data from apis for choosen station
function getStationResult(station){
	$.ajax({
		'url': 'https://apis.is/weather/forecasts/en',
		'type': 'GET',
		'dataType': 'json',
		'data': {'stations': station},
		'timeout': 5000,
	}).done(function(response) {
		if (response['results'][0]['err'] != '') {
			showErrors('Get error message: "' + response['results'][0]['err'] + '"" from apis.is. Please try again later or choose another station.');
		}
		else {
			$('#errorMessage').hide();
			$('#chartdiv').show();
			$.when(getInfomation(response['results'][0]['forecast'])).then(drawChart());
		}
	}).fail(function(jsonRequest, textStatus, errorThrown){
		console.log(errorThrown);
		showErrors('Could not connect to apis.is in 5sec. Please try again later!')
	});
}

// check connection errors on loading file
var checkErrors = function() {
	var station = document.getElementById('stations');
	if (station.children.length == 0) {
		showErrors('Could not get json file. Please check the local file!');
	}
}

// show connection errors
function showErrors(msg) {
	$('#errorMessageText').text(msg);
	$('#errorMessage').show();
	$('#checkboxes').hide();
	$('#chartdiv').hide();
}

// get all necessary information and push them to their arrays
var getInfomation = function(data) {
	for (var key in data) {
		data_obj = data[key];
		if (typeof data_obj !== 'object'){
			continue;
		}
		windSpeed.push(parseInt(data_obj['F']));
		temperature.push(parseInt(data_obj['T']));
		dewLimit.push(parseInt(data_obj['TD']));
		categories.push(data_obj['ftime']);
	}
}

// Hander checkboxes click event
function checkboxClick(data) {
	drawChart();
}

// Draw charts
var drawChart = function() {
	var title = 'Weather forecast for ' + stationName;
	var series = [];
	if (document.getElementById("windspeed").checked == true){
		series.push({name: 'Wind Speed', data: windSpeed});
	}
	if (document.getElementById("dewlimit").checked == true){
		series.push({name: 'Dew Limit', data: dewLimit});
	}
	if (document.getElementById("temperature").checked == true){
		series.push({name: 'Air Temperature', data: temperature});
	}

	if (series.length == 0) {
		alert('Please choose at least one option!');
	}
	Highcharts.chart('chartdiv', {
		chart: {
		    type: 'line'
		},
		title: {
			text: title
		},
		subtitle: {
			text: 'Source: Apis.is'
		},
		xAxis: {
			categories: categories
		},
		plotOptions: {
			line: {
			dataLabels: {
				enabled: true
			},
			enableMouseTracking: false
		}
		},
		yAxis: {
			title: {
				text: 'Temperature (°C)/ Wind Speed (m/s)'
			}
		},
		series: series
	});
	
}
