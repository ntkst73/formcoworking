//загружаем модуль для уведомлений
$.getScript("./notiflix-main/dist/notiflix-notify-aio-3.2.6.min", function(){
	Notiflix.Notify.success('TEST Сценарий загружен.', {timeout: 15000,},);
});
var pathname = window.location.pathname;
let centerCoordObj = {
	'Санкт-Петербург': { lat: 59.947326, lng: 30.345493	},
	'Нижний Новгород': { lat: 56.330166, lng: 43.995018	},
	   'Великие Луки': { lat: 56.344471, lng: 30.519118	},
		  'Новосибирск': { lat: 55.028888, lng: 82.926484	},
		  	'Махачкала': { lat: 42.966437, lng: 47.503272	},
					 'Москва': { lat: 55.732839, lng: 37.666495 },
		 			 'Самара': { lat: 53.204277, lng: 50.148388	}
};
let latitude = centerCoordObj['Санкт-Петербург'].lat;
let longitude = centerCoordObj['Санкт-Петербург'].lng;

// Делаем переменную map глобальной
var map;

function initMap() {
	if (this.google === undefined) return;

// Стили для карты
	var styles = [{ featureType: 'all',	stylers: [{ saturation: -85 }] }];

// Инициализируем карту
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: latitude, lng: longitude},
		zoom: 11,
		disableDefaultUI: true,
		zoomControl: true,
		styles: styles,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scrollwheel: false
	});

// Устанавливаем правильный зум в зависимости от ширины экрана
	let containerWidth = $('.locations-map-block').width();
	if (containerWidth < 1100) map.setZoom(11);
	if (containerWidth < 700) map.setZoom(10);

// Маркеры
	var markers = [];
	var icon = {
		url: 'assets/img/img-pointer-places.svg',
		origin: new google.maps.Point(30, 0),
		size: new google.maps.Size(30, 45),
		scaledSize: new google.maps.Size(423, 45)
	};

	for (var location in locationsObj) {
		let marker = new google.maps.Marker({
			position: { lat: locationsObj[location].lat, lng: locationsObj[location].lng },
			infocontent: locationsObj[location].infowindow
		});
		marker.setMap(map);
		marker.setIcon(icon);
		markers.push(marker);
	}

// Инфоокна
	var infowindows = [];
	for (let i = 0; i < markers.length; i++) {
	  let marker = markers[i];
		infowindows[i] = new InfoBubble({
			closeSrc: '/assets/img/img-close-black.svg',
			backgroundClassName: 'info-window',
			content: marker.infocontent,
			disableAnimation: true,
			hideCloseButton: false,
			disableAutoPan: false,
			borderRadius: 0,
			shadowStyle: 1,
			borderWidth: 0,
			minWidth: 250,
			maxWidth: 250,
			arrowSize: 0,
			padding: 10,
			map: map
			// arrowPosition
			// arrowStyle
			// backgroundColor
			// borderColor
			// maxHeight
			// minHeight
		});

		let infowindow = infowindows[i];

		function infoOpener(infowin, mark) {
			google.maps.event.addListener(mark, 'click', function() {
				infowin.open(map, mark);
			});
		}

		if (marker.infocontent !== undefined) infoOpener(infowindow, markers[i]);

	}
}

ymaps.ready(function() {
	var geolocation = ymaps.geolocation;
	$('#cou').html(geolocation.country);
	$('#reg').html(geolocation.region);
	$('#cit').html(geolocation.city);

// Вытягиваем из адресной строки название города
	let URIparams = {};
	window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
		URIparams[key] = decodeURI(value);
	})

	let URIcity = URIparams.city;
	let cityArr = [];
  let cityArrUniqe = [];

	$('.meetingrooms-page-item').each(function(){ cityArr.push($(this).attr('attr-city')); });

	for (let city of cityArr) {
    if (!cityArrUniqe.includes(city)) {
      cityArrUniqe.push(city);

      $('#filter-city').append(`<li attr-city="${city}">${city}</li>`);

      if (city == geolocation.city) {
      	$('#filter-city li[attr-city = "' + city + '"]').addClass('active');
      	$('.meetingrooms-page-item[attr-city = "' + city + '"]').addClass('visible');
				window.history.pushState('object or string', 'Title', pathname + '?city=' + city);
				latitude = centerCoordObj[city].lat;
				longitude = centerCoordObj[city].lng;
      }
    }
  }

// Если находимся в месте где Практика нет
	if (!cityArrUniqe.includes(geolocation.city)) {
		$('.meetingrooms-page-item').addClass('visible');
	}

	if (cityArrUniqe.includes(URIcity)) {
		$('#filter-city li').removeClass('active');
    $('.meetingrooms-page-item').removeClass('visible');

		$('#filter-city li[attr-city = "' + URIcity + '"]').addClass('active');
    $('.meetingrooms-page-item[attr-city = "' + URIcity + '"]').addClass('visible');
		window.history.pushState('object or string', 'Title', pathname + '?city=' + URIcity);

		latitude = centerCoordObj[URIcity].lat;
		longitude = centerCoordObj[URIcity].lng;

		// map.panTo(centerCoordObj[URIcity]);
		// map.setCenter(centerCoordObj[URIcity]);
		// map.setCenter({lat: centerCoordObj[URIcity].lat, lng: centerCoordObj[URIcity].lng});

	}

	$('#filter-city li').each(function() {
		$(this).click(function() {
			let city = $(this).attr('attr-city');
			$('#filter-city li').removeClass('active');
			$(this).addClass('active');

			$('.meetingrooms-page-item').removeClass('visible');
			$('.meetingrooms-page-item[attr-city = "' + city + '"]').addClass('visible');
			window.history.pushState('object or string', 'title', pathname + '?city=' + city);
			map.panTo(centerCoordObj[city]);

// Починяем слайдер после display:none
			$('.meetingrooms-page-item[attr-city = "' + city + '"] .b-mr__slider').each(function() {
				let sliderIndex = $(this).attr('attr-index');
				$('#b-mr__slider' + sliderIndex).slick('setPosition');
			});

		});
	});

	initMap();

});

var word_from = ' from ';
var word_to = ' to ';
var word_addoptions = 'Additional options:<br>'
var word_no = 'none';
if (!~pathname.indexOf('/en/')) {
	moment.updateLocale('en', {
		months: 'Января_Февраля_Марта_Апреля_Мая_Июня_Июля_Августа_Сентября_Октября_Ноября_Декабря'.split('_'),
	 	weekdaysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
	});
	word_from = ' с ';
	word_to = ' до ';
	word_addoptions = 'Дополнительные опции:<br>'
	word_no = 'нет';
};
moment.updateLocale('en', {week: {dow: 1}}); // Monday is the first day of the week

let pricesObj = createPricesObj();

var curDate = moment();
moment.tz.setDefault("Europe/Moscow");
var weeksCount = 3;

if (curDate.hours() * 60 + curDate.minutes() > 18 * 60) curDate = curDate.date(curDate.date() + 1).hours(9).minutes(0);
if (curDate.hours() * 60 + curDate.minutes() < 9 * 60) curDate = curDate.hours(9).minutes(0);

var startDate = moment(curDate).hours(9).minutes(0).subtract(curDate.weekday(), 'days');

var calendars = {};
var mrCount = 0;

// Собираем инфу о переговорках со страницы
$('.popup_meetingroom').each(function() {
	calendars[mrCount] = {};
	calendars[mrCount].id = $(this).attr('id');
	calendars[mrCount].half_hour_price = $(this).attr('attr-price').replace(/\D+/g,"") / 2;
	calendars[mrCount].half_hour_low_price = $(this).attr('attr-low-price').replace(/\D+/g,"") / 2;
	calendars[mrCount].loc = $(this).attr('attr-loc');
	calendars[mrCount].cap = $(this).attr('attr-cap');
	calendars[mrCount].adress = $(this).attr('attr-adress');
	// $(this).find('form .checkbox:nth-of-type(3)').html($(this).find('form .checkbox:nth-of-type(3) li:nth-of-type(6)').html());
	mrCount++;
});

// Заполняем объект балванками со статусами (недоступно = 0, занято = 2) каждого сеанса доступного для бронирования
// и пихаем в страницу и формируем и пихаем в страницу шкалы дат и времени
let screenWidth = $('header').width();

for (let mr = 0; mr < mrCount; mr++) {
	let seanceDate = moment(startDate);
	for (let w = 0; w < weeksCount; w++) {
		let week = '';
		for (let d = 0; d < 7; d++) {
			seanceDate.hours(9).minutes(0);

			let dateLine = screenWidth < 760 ? seanceDate.format('DD.MM') : seanceDate.format('DD MMMM');
			$('#' + calendars[mr].id + ' .mr_dateline.w' + w).append('<p>' + dateLine + '<span class="week_day">' + seanceDate.format('dd') + '</span></p>');

			for (let h = 0; h < 24; h++) {
				let n = w * 168 + d * 24 + h;
				calendars[mr][n] = {};
				calendars[mr][n].datetime = seanceDate.format('YYYY-MM-DDTHH:mm') + ':00+03:00';
				if (seanceDate < curDate ) {
					calendars[mr][n].status = 0;
					week += '<div class="mr_d_u" attr-n="' + n + '"></div>';
				} else {
					calendars[mr][n].status = 2;
					week += '<div class="mr_d_f" attr-n="' + n + '"></div>';
				}
				seanceDate.minutes(seanceDate.minutes() + 30);
			}
			seanceDate.date(seanceDate.date() + 1);
		}
		$('#' + calendars[mr].id + ' .mr_dates.w' + w).append(week);
	}
}

// Показываем форму и расставляем свободные сеансы
$('a.poplight_mr[href*=\\#]').click(function(e) {

	e.preventDefault();
	var popID = $(this).attr('rel');
	for (var mr = 0; mr < mrCount; mr++) {
		if (calendars[mr].id == popID) break;
	}

	$('#' + popID).fadeIn();
	let popMargTop = ($('#' + popID).height() + 80)/ 2;
	$('#' + popID).css({'margin-top' : -popMargTop});

	$('body').append('<div id="fade"></div>'); //div контейнер будет прописан перед тегом </body>.
	$('#fade').fadeIn();
	//fillMR_new(mr, addLissoners);
	fillMR2(mr, addLissoners);
	if(typeof(getCookie("phone")) != "undefined") {
		$("[name='telFF']").val(getCookie("phone"));
		$("[name='nameFF']").val(getCookie("fullname"));
		$("[name='emailFF']").val(getCookie("email"));
		//Notiflix.Notify.success('Cookes: ' + getCookie("phone") + getCookie("fullname") + getCookie("email"), {timeout: 15000,},);
	}
	return false;
});

// Формируем объект с ценами
function createPricesObj() {
	let request = new XMLHttpRequest();
	let pricesObj = {};
	request.open('GET', 'https://api.yclients.com/api/v1/services/860164?category_id=1356060');
    request.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p');
    request.setRequestHeader('Accept', 'application/vnd.api.v2+json');
    request.send();
	request.onreadystatechange = function () {
	  if (request.readyState == 4) {
		  if (request.status == 200) {

				let responsePriceObj = JSON.parse(this.responseText);
				for (let i in responsePriceObj) {
				  pricesObj[responsePriceObj[i].price_min] = responsePriceObj[i].id;
				}
// Цена для резидентов чтоб не путалась с ценой для брокеров
				pricesObj[0] = 2149932;

		  } else {
			  Notiflix.Notify.failure('Что-то с ценами пошло не так ;( . Попробуйте позднее. Error:#0-'+request.status, {timeout: 15000,},);
		  }
	  }
	};
	return pricesObj;
}

// Запрашиваем свободные сеансы и меняем статусы в объекте (свободно = 1) и классы на странице
function fillMR_new(mrId, secondcallback) {//vit add callback parametr
	let request = new XMLHttpRequest();
	let periodString = '&start_date=' + curDate.format('YYYY-MM-DD') + '&end_date=' + startDate.add(20, 'days').format('YYYY-MM-DD');
	request.open('GET', 'https://api.yclients.com/api/v1/records/860164?staff_id=' + calendars[mrId].id + periodString);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p, User ee5d8dde2caf6474ca20729c480e19ee');
	request.setRequestHeader('Accept', 'application/vnd.yclients.v2+json');

	request.onreadystatechange = function () {
	  if (request.readyState == 4) {//vit разделил проверки статуса загрузки и возвращаемого ответа
		  if (request.status == 200) {//vit разделил проверки статуса загрузки и возвращаемого ответа
			let dayFreeObj = JSON.parse(this.responseText);

			for (let i in dayFreeObj.data) {
				toop: for (let w = 0; w < weeksCount; w++) {
					for (let d = 0; d < 7; d++) {
						for (h = 0; h < 24; h++) {
							let n = w * 168 + d * 24 + h;
							if (calendars[mrId][n].datetime == dayFreeObj.data[i].datetime) {

								for (let j = 0; j < (dayFreeObj.data[i].seance_length / 1800); j++) {
									if (calendars[mrId][n + j].status != 0) {
										calendars[mrId][n + j].status = 1;
										$('#' + calendars[mrId].id + ' [attr-n = "' + (n + j) + '"]').addClass('mr_d_o').removeClass('mr_d_f');
									}
								}
								break toop;
							}
						}
					}
				}
			}

			secondcallback(mrId);//vit add. Start callback function
		  } else {//vit добавил вывод ошибки при неверном ответе
			  Notiflix.Notify.failure('Что-то пошло не так ;( . Попробуйте позднее. Error:#0-'+request.status, {timeout: 15000,},);
		  }
	  }//vit разделил проверки статуса загрузки и возвращаемого ответа
	};
	request.send();
}

function fillMR2(mrId, secondcallback) {//vit add callback parametr
	let request = new XMLHttpRequest();
	let periodString = '&start_date=' + curDate.format('YYYY-MM-DD') + '&end_date=' + startDate.add(20, 'days').format('YYYY-MM-DD');
	request.open('GET', 'https://api.yclients.com/api/v1/records/860164?staff_id=' + calendars[mrId].id + periodString);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p, User ee5d8dde2caf6474ca20729c480e19ee');
	request.setRequestHeader('Accept', 'application/vnd.yclients.v2+json');

	request.onreadystatechange = function () {
		if (request.readyState == 4) {//vit разделил проверки статуса загрузки и возвращаемого ответа
			if (request.status == 200) {//vit разделил проверки статуса загрузки и возвращаемого ответа
				let dayFreeObj = JSON.parse(this.responseText);

				for (let i in dayFreeObj.data) {
					toop: for (let w = 0; w < weeksCount; w++) {
						for (let d = 0; d < 7; d++) {
							for (h = 0; h < 24; h++) {
								let n = w * 168 + d * 24 + h;
								//vit insert округляем до 30 минут сеансы из юкланс и в них же и записываем
								let seanceDate = moment(dayFreeObj.data[i].datetime);
								let minutes = seanceDate.minutes();
								if (minutes > 30) {
									dayFreeObj.data[i].seance_length = dayFreeObj.data[n].seance_length + minutes * 60 - 1800;
									seanceDate.minutes(30);
								}
								if (minutes < 30 && minutes) {
									dayFreeObj.data[i].seance_length = dayFreeObj.data[n].seance_length + minutes * 60;
									seanceDate.minutes(0);
								}
								dayFreeObj.data[i].datetime = seanceDate.format('YYYY-MM-DDTHH:mm') + ':00+03:00';
								//end vit insert
								if (calendars[mrId][n].datetime == dayFreeObj.data[i].datetime) {
									for (let j = 0; j < (dayFreeObj.data[i].seance_length / 1800); j++) {
										if (calendars[mrId][n + j].status != 0) {
											calendars[mrId][n + j].status = 1;
											$('#' + calendars[mrId].id + ' [attr-n = "' + (n + j) + '"]').addClass('mr_d_o').removeClass('mr_d_f');
										}
									}
									break toop;
								}
							}
						}
					}
				}

				secondcallback(mrId);//vit add. Start callback function
			} else {//vit добавил вывод ошибки при неверном ответе
				Notiflix.Notify.failure('Что-то пошло не так ;( . Попробуйте позднее. Error:#0-'+request.status, {timeout: 15000,},);
			}
		}//vit разделил проверки статуса загрузки и возвращаемого ответа
	};
	request.send();
}

function addLissoners(mrId) {

	$('#' + calendars[mrId].id + ' .mr_d_f').on('click', function(event) {
		$('#' + calendars[mrId].id + ' button').addClass('btn-active');
		var n = parseInt($(this).attr('attr-n'), 10);
		var nP = n - 1;
		var n1 = n + 1;
		var n2 = n + 2;
		var n3 = n + 3;
		var difDates = false;
		// var dayEndFlag = n % 24 > 20 ? true : false;
		var dayEndFlag = n % 24 > 20;
		if (n == 0) nP = 0;
		if (moment(calendars[mrId][n].datetime).date() != moment(calendars[mrId][nP].datetime).date() &&
			  !$('#' + calendars[mrId].id + ' [attr-n = "' + n1 + '"]').hasClass('checked')) {
			difDates = true;
		}
		if (moment(calendars[mrId][n].datetime).date() != moment(calendars[mrId][n1].datetime).date() &&
			  !$('#' + calendars[mrId].id + ' [attr-n = "' + nP + '"]').hasClass('checked')) {
			difDates = true;
		}

		if (difDates ||
			 !$('#' + calendars[mrId].id + ' [attr-n = "' + nP + '"]').hasClass('checked') &&
			 !$('#' + calendars[mrId].id + ' [attr-n = "' + n1 + '"]').hasClass('checked')) {

			$('#' + calendars[mrId].id + ' .mr_d_f').removeClass('checked');
			calendars[mrId].amount = 0;
			$('#' + calendars[mrId].id + ' button').removeClass('btn-active');
			$('#rs_' + calendars[mrId].id).removeAttr('style');

		} else {
			if (!$(this).hasClass('checked')) calendars[mrId].amount++;
			if ($('#' + calendars[mrId].id + ' [attr-n = "' + n1 + '"]').hasClass('checked') &&
				 !$('#' + calendars[mrId].id + ' [attr-n = "' + nP + '"]').hasClass('checked')) {
				calendars[mrId].eventstart = calendars[mrId][n].datetime;
			};
			$(this).addClass('checked');
		}

// Дополнительные возможности для резидентов
		if (event.altKey && event.shiftKey &&
				!$(this).hasClass('checked') &&
				!$(this).prev().hasClass('checked') &&
				!$(this).next().hasClass('checked')) {
			$('#' + calendars[mrId].id + ' .mr_d_f').removeClass('checked');
			$(this).addClass('checked');
			calendars[mrId].eventstart = calendars[mrId][$(this).attr('attr-n')].datetime;
			calendars[mrId].amount = 1;
		}

		if (event.altKey && event.shiftKey && $(this).hasClass('checked')) {
			if ($(this).prev().hasClass('checked') && !$(this).next().hasClass('checked')) {
				$(this).removeClass('checked');
				calendars[mrId].amount--;
			}
			if (!$(this).prev().hasClass('checked') && $(this).next().hasClass('checked')) {
				$(this).removeClass('checked');
				calendars[mrId].eventstart = calendars[mrId][$(this).next().attr('attr-n')].datetime;
				calendars[mrId].amount--;
			}
		}

		if (!$('#' + calendars[mrId].id + ' [attr-n = "' + nP + '"]').hasClass('checked') &&
				!$('#' + calendars[mrId].id + ' [attr-n = "' + n1 + '"]').hasClass('checked') &&
				!$('#' + calendars[mrId].id + ' [attr-n = "' + n1 + '"]').hasClass('mr_d_o') &&
				!$('#' + calendars[mrId].id + ' [attr-n = "' + n2 + '"]').hasClass('mr_d_o') &&
				!$('#' + calendars[mrId].id + ' [attr-n = "' + n3 + '"]').hasClass('mr_d_o') &&
				!dayEndFlag) {
	  	for (var i = 0; i < 4; i++) {
				var j = n + i;
				$('#' + calendars[mrId].id + ' [attr-n = "' + j + '"]').addClass('checked');
			};
			calendars[mrId].amount = 4;
			calendars[mrId].eventstart = calendars[mrId][n].datetime;
			$('#' + calendars[mrId].id + ' button').addClass('btn-active');
		}

		if (calendars[mrId].amount < 8) {
			calendars[mrId].price = calendars[mrId].half_hour_price * calendars[mrId].amount;
			calendars[mrId].serviceid = pricesObj[calendars[mrId].half_hour_price];
		} else {
			calendars[mrId].price = calendars[mrId].half_hour_low_price * calendars[mrId].amount;
			calendars[mrId].serviceid = pricesObj[calendars[mrId].half_hour_low_price];
		}
		// Аренда для резидентов
		if (calendars[mrId].amount < 4) {
			calendars[mrId].serviceid = pricesObj[0];
			calendars[mrId].price = 0;
		}

		// console.log(calendars[mrId].eventstart, calendars[mrId].amount, calendars[mrId].price);
		if (calendars[mrId].amount != 0) $('#rs_' + calendars[mrId].id).css({ display: 'flex' });
		$('#rs-date_' + calendars[mrId].id).html(moment(calendars[mrId].eventstart).format('DD.MM.YYYY'));
		$('#rs-time_' + calendars[mrId].id).html(word_from + moment(calendars[mrId].eventstart).format('HH:mm') +
		word_to + moment(calendars[mrId].eventstart).minutes(moment(calendars[mrId].eventstart).minutes() + calendars[mrId].amount * 30 - 5).format('HH:mm'));
		$('#rs-price_' + calendars[mrId].id).html(calendars[mrId].price + ' ₽');

	});

// Добовляем обработчики стрелок для листания недель
	$('#' + calendars[mrId].id + ' .next_week').on('click', function() {
		if ($('#' + calendars[mrId].id + ' .next_week').hasClass('active')) {
			week = $('#' + calendars[mrId].id + ' .visible').attr('attr-week');
			$('#' + calendars[mrId].id + ' .visible').removeClass('visible');
			if (week == 0) {
				$('#' + calendars[mrId].id + ' .w1').addClass('visible');
				$('#' + calendars[mrId].id + ' .prev_week').addClass('active');
			}
			if (week == 1) {
				$('#' + calendars[mrId].id + ' .w2').addClass('visible');
				$('#' + calendars[mrId].id + ' .next_week.active').removeClass('active');
			}
		}
	});

	$('#' + calendars[mrId].id + ' .prev_week').on('click', function() {
		if ($('#' + calendars[mrId].id + ' .prev_week').hasClass('active')) {
			week = $('#' + calendars[mrId].id + ' .visible').attr('attr-week');
			$('#' + calendars[mrId].id + ' .visible').removeClass('visible');
			if (week == 2) {
				$('#' + calendars[mrId].id + ' .w1').addClass('visible');
				$('#' + calendars[mrId].id + ' .next_week').addClass('active');
			}
			if (week == 1) {
				$('#' + calendars[mrId].id + ' .w0').addClass('visible');
				$('#' + calendars[mrId].id + ' .prev_week.active').removeClass('active');
			}
		}
	});
};

// возвращает куки с указанным name,
// или undefined, если ничего не найдено
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Сбор инфы из формы бронирования и запрос СМС кода
$('.meetingroom_form').submit(function(evt) {
  evt.preventDefault();
  var request0 = new XMLHttpRequest(), f = this;
	request0.open('POST', 'https://api.yclients.com/api/v1/book_code/860164');
	request0.setRequestHeader('Content-Type', 'application/json');
	request0.setRequestHeader('Accept', 'application/vnd.yclients.v2+json');
	request0.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p');

	var parentId = $($(f).parent('.popup_meetingroom')).attr('id');
	for (var mr = 0; mr < mrCount; mr++) {
		if (calendars[mr].id == parentId) break;
	}

// Собираем доп опции по чекбоксам в форме
	var comment = '';
	$('#' + calendars[mr].id + ' form .form-group:nth-of-type(4) input').each(function() {
		if ($(this).prop('checked')) {
			comment = comment + $(this).next().html() + ', ';
		}
	});
	if (comment == '') {
		comment = word_no;
	} else {
		comment = comment.slice(0, -2);
	}
	calendars[mr].phone = f.telFF.value.replace(/\D+/g,"");
	calendars[mr].fullname = f.nameFF.value;
	calendars[mr].email = f.emailFF.value;
	calendars[mr].comment = 'Доп. опции: ' + comment;

	//vit add cookie
	document.cookie = "phone=" + f.telFF.value;
	document.cookie = "fullname=" + encodeURIComponent(calendars[mr].fullname);
	document.cookie = "email=" + calendars[mr].email;
	//Notiflix.Notify.success(document.cookie);

	var body = {
	  'phone': calendars[mr].phone,
	  'fulname': calendars[mr].fullname
	};

	//если куки последнего раза подтверждения номера еще живы
	if (typeof(getCookie("smscode")) != "undefined") {
		if (getCookie("smscode").replace(/\D+/g,"") == calendars[mr].phone) {
			//Notiflix.Notify.success('Номер уже подтвержден.', {timeout: 15000,},);
			WithoutSMScode(mr);
		}
	} else {
		// иначе Вывод формы ввода СМС кода
		request0.onreadystatechange = function () {
			if (request0.readyState == 4) {//vit разделил проверки статуса загрузки и возвращаемого ответа
				switch (request0.status) {
					case 201:
						Notiflix.Notify.success('Проверочный код отправлен на номер:' + calendars[mr].phone + ' в WhatsApp/SMS. Код придет в течении 2 минут', {timeout: 15000,},);
						AfterSendSMS(mr);
						break;
					case 422:
						Notiflix.Notify.failure('Превышено количество отправок SMS/WhatsApp на данный номер: ' + calendars[mr].phone + '. Попробуйте позднее.', {timeout: 60000,},);
						break;
					default:
						Notiflix.Notify.failure('Что-то пошло не так ;( . Попробуйте позднее. Error:#1-'+request0.status, {timeout: 15000,},);
						Notiflix.Notify.failure('Не удалось отправить код на номер:' + calendars[mr].phone + ' в WhatsApp/SMS.', {timeout: 15000,},);
				}
			}
		};
		request0.send(JSON.stringify(body));
	}

});

function AfterSendSMS(mr) {
	$('#ci-bio').html(calendars[mr].fullname + ', ' + calendars[mr].phone  + '<br>' + calendars[mr].email);
	$('#ci-date-time').html(moment(calendars[mr].eventstart).format('DD.MM.YYYY') +
		word_from + moment(calendars[mr].eventstart).format('HH:mm') +
		word_to + moment(calendars[mr].eventstart).minutes(moment(calendars[mr].eventstart).minutes() + calendars[mr].amount * 30 - 5).format('HH:mm'));
	$('#ci-adress').html(calendars[mr].loc + '<div>' + calendars[mr].adress + '</div>');
	$('#ci-cap').html(calendars[mr].cap);
	$('#ci-options').html(word_addoptions + calendars[mr].comment);
	$('#ci-price').html(calendars[mr].price + ' ₽');
	$('.popup_block').fadeOut();
	$('.popup_codeinput').fadeIn();
	// Бронирование cеанса
	$('.smscode_form').submit(function(evt) {
		evt.preventDefault();
		var request1 = new XMLHttpRequest(), f = this;
		request1.open('POST', 'https://api.yclients.com/api/v1/book_record/860164');
		request1.setRequestHeader('Content-Type', 'application/json');
		request1.setRequestHeader('Accept', 'application/vnd.yclients.v2+json');
		request1.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p');

		$('.popup_codeinput .btn').addClass('btn-inactive');
		body = {
			"phone": calendars[mr].phone,
			"fullname": calendars[mr].fullname,
			"email": calendars[mr].email,
			"comment": calendars[mr].comment,
			"code": f.codeFF.value,
			"appointments": [
				{
					"id": 1,
					"services": [calendars[mr].serviceid],
					"staff_id": calendars[mr].id,
					"datetime": calendars[mr].eventstart
				}
			]
		};
		request1.onreadystatechange = function () {
			if (request1.readyState == 4) {
				switch (request1.status) {
					case 403:
						$('#input-wrapper').addClass('wrong_sms_code');
						$('.popup_block.popup_codeinput .btn').removeClass('btn-inactive');
						Notiflix.Notify.failure('Введен не верный код из WhatsApp/SMS.', {timeout: 15000,},);
						break;
					case 201:
						document.cookie = "smscode="+calendars[mr].phone+"; max-age=1814400; secure";//604800 - неделя в секундах 1814400 - три
						var book_recordArr = JSON.parse(request1.responseText);//add vit
						var record_id = book_recordArr['data'][0]['record_id'];//['data'][1]['record_id'];//add vit
						// Изменение длинны сеанса
						var request2 = new XMLHttpRequest();
						request2.open('PUT', 'https://api.yclients.com/api/v1/record/860164/' + record_id);
						request2.setRequestHeader('Content-Type', 'application/json');
						request2.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p, User ee5d8dde2caf6474ca20729c480e19ee');

						body = {
							"staff_id": calendars[mr].id,
							"services": [
								{
									"id": calendars[mr].serviceid,
									"amount": calendars[mr].amount,
									"cost": calendars[mr].price
								}
							],
							"client": {
								"phone": calendars[mr].phone,
								"name": calendars[mr].fullname,
								"email": calendars[mr].email
							},
							"save_if_busy": true,
							"datetime": calendars[mr].eventstart,
							"seance_length": calendars[mr].amount * 1800 - 300,
							"send_sms": true
						};

						request2.onreadystatechange = function () {
							if (request2.readyState == 4) {
								switch (request2.status) {
									case 201:
										Notiflix.Notify.success('Переговорка успешно забронирована', {timeout: 15000,},);
										$('.popup_codeinput form').css('display', 'none');
										$('.popup_codeinput .mr_conferm').css('display', 'none');

										setTimeout(removeConferm, 2500);

										function removeConferm() {
											$('#fade, .popup_block').fadeOut(function () {
												$('.popup_block').css('display', 'none');
												location.reload();
												// $('#fade').remove();
											});
										}
										break;
									case 404:
										Notiflix.Notify.success('404 Старница не найдена. ' + 'https://api.yclients.com/api/v1/record/860164/' + record_id, {timeout: 15000,},);
										break;
									default:
										Notiflix.Notify.failure('Что-то пошло не так ;( . Попробуйте позднее. Error:#3-' + request2.status, {timeout: 15000,},);
								}
							}
						};

						request2.send(JSON.stringify(body));
						break;
					default:
						Notiflix.Notify.failure('Что-то пошло не так ;( . На данное промежуток переговорка уже забронирвана. Error:#2-' + request1.status, {timeout: 15000,},);
				}//end switch
			}
		};

		request1.send(JSON.stringify(body));

	});
}

function WithoutSMScode(mr) {
	$('#ci-bio').html(calendars[mr].fullname + ', ' + calendars[mr].phone  + '<br>' + calendars[mr].email);
	$('#ci-date-time').html(moment(calendars[mr].eventstart).format('DD.MM.YYYY') +
		word_from + moment(calendars[mr].eventstart).format('HH:mm') +
		word_to + moment(calendars[mr].eventstart).minutes(moment(calendars[mr].eventstart).minutes() + calendars[mr].amount * 30 - 5).format('HH:mm'));
	$('#ci-adress').html(calendars[mr].loc + '<div>' + calendars[mr].adress + '</div>');
	$('#ci-cap').html(calendars[mr].cap);
	$('#ci-options').html(word_addoptions + calendars[mr].comment);
	$('#ci-price').html(calendars[mr].price + ' ₽');
	$('.popup_block').fadeOut();
	$('.popup_codeinput').fadeIn();
	$('.popup_codeinput form').css('display', 'none');
	$('.popup_codeinput .mr_conferm').css('display', 'block');
	// Бронирование cеанса
	//evt.preventDefault();
	var request1 = new XMLHttpRequest(), f = this;
	request1.open('POST', 'https://api.yclients.com/api/v1/records/860164');
	request1.setRequestHeader('Content-Type', 'application/json');
	request1.setRequestHeader('Accept', 'application/vnd.yclients.v2+json');
	request1.setRequestHeader('Authorization', 'Bearer tz79eyd9w43x6r3rkm5p, User ee5d8dde2caf6474ca20729c480e19ee');

	body = {
		"staff_id": calendars[mr].id,
		"services": [
			{
				"id": calendars[mr].serviceid,
				"amount": calendars[mr].amount,
				"cost": calendars[mr].price
			}
		],
		"client": {
			"phone": calendars[mr].phone,
			"name": calendars[mr].fullname,
			"email": calendars[mr].email
		},
		"save_if_busy": true,
		"datetime": calendars[mr].eventstart,
		"seance_length": calendars[mr].amount * 1800 - 300,
		"send_sms": true,
		//"sms_remain_hours": 24,
	};
	request1.onreadystatechange = function () {
		if (request1.readyState == 4) {
			switch (request1.status) {
				case 201:
					Notiflix.Notify.success('Переговорка успешно забронирована', {timeout: 15000,},);
					$('.popup_codeinput form').css('display', 'none');
					$('.popup_codeinput .mr_conferm').css('display', 'block');

					setTimeout(removeConferm, 2500);

				function removeConferm() {
					$('#fade, .popup_block').fadeOut(function () {
						$('.popup_block').css('display', 'none');
						location.reload();
						// $('#fade').remove();
					});
				}
					break;
				case 404:
					//var book_recordArr = JSON.parse(request1.responseText);//add vit
					//var record_id = book_recordArr['data'][0]['record_id'];//['data'][1]['record_id'];//add vit
					Notiflix.Notify.success('404 Старница не найдена. ' + 'https://api.yclients.com/api/v1/record/860164/ ' + request1.responseText, {timeout: 15000,},);
					break;
				default:
					Notiflix.Notify.failure('Что-то пошло не так ;( . Попробуйте позднее. Error:#23-' + request1.status + 'Result: ' + request1.responseText, {timeout: 15000,},);
			}
		}
	};

	request1.send(JSON.stringify(body));
}