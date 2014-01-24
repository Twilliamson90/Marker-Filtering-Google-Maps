// revealing module pattern
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript

var myMap = function() {

	var	options = {
		zoom: 4,
		center: new google.maps.LatLng(38.810821,-95.053711),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	// :: Public Function ::
	function init(mapId) {
		map = new google.maps.Map(document.getElementById(mapId), options);
		loadPersonMarkers();
	}

	/*
		== MARKERS ==
	*/

	var markers = {}; // this needs to be moved later, maybe a setup object
	var markerList = [];

	// :: Public Function ::
	function loadPersonMarkers(person) {

		// optional argument of person
		var person = typeof person !== 'undefined' ? person : personData;

		var j = 1; //temp for lorempixel

		for( i=0; i < person.length; i++ ) {

			// if its already on the map, dont put it there again
			if( markerList.indexOf(person[i].id) !== -1 ) continue;

			var lat = person[i].lat,
				lng = person[i].lng,
				markerId = person[i].id;

			var infoWindow = new google.maps.InfoWindow({
				maxWidth: 400
			});

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng( lat, lng ),
				title: person[i].name,
				markerId: markerId,
				icon: 'img/red-fat-marker.png',
				map: map
			});

			markers[markerId] = marker;
			markerList.push(person[i].id);

			if( j > 10 ) j = 1; //temp for lorempixel
			var content = '<div class="iw"><img src="http://lorempixel.com/90/90/people/'+j+'" width="90" height="90">' +
				'<div class="iw-text"><strong>' + person[i].name + '</strong><br>Age: ' + person[i].age +
				'<br>Followers: ' + person[i].followers + '<br>Job: ' + person[i].occupation +
				'<br>College: ' + person[i].college + '</div></div>';
			j++; //temp for lorempixel
			
			google.maps.event.addListener(marker, 'click', (function (marker, content) {
				return function() {
					infoWindow.setContent(content);
					infoWindow.open(map, marker);
				}
			})(marker, content));	
		}
	}

	function removePersonMarker(id) {
		if( markers[id] ) {
			markers[id].setMap(null);
			loc = markerList.indexOf(id);
			if (loc > -1) markerList.splice(loc, 1);
			delete markers[id];
		}
	}

	/*
		== FILTER ==
	*/

	// Args: Array (of arrays)
	// Returns: Array (common elements from all arrays)
	function reduceArray(a) {
		r = a.shift().reduce(function(res, v) {
			if (res.indexOf(v) === -1 && a.every(function(a) {
				return a.indexOf(v) !== -1;
			})) res.push(v);
			return res;
		}, []);
		return r;
	}

	function isInt(n) {
	    return n % 1 === 0;
	}

	var filter = {
		followers: 0,
		college: 0,
		from: 0
	}
	var filterMap;

	// :: Public Function ::
	function filterCtrl(source, code) {
		var r = [];

		if( isInt(code) ) {
			filter[source] = parseInt(code);
		} else {
			filter[source] = code;
		}

		console.log(filter);
		
		for( k in filter ) {
			if( !filter.hasOwnProperty(k) && !( filter[k] !== 0 ) ) {
				// all the filters are off
				loadPersonMarkers();
				return false;
			} else if ( filter[k] !== 0 ) {
				// append to r array and call the appropriate filterMap function
				r.push(filterMap[k](filter[k])); // bad-ass
			} else {
				console.log(k); // fail silently, jk idk what this is yet
			}
		}

		if( filter[source] === 0 ) r.push(personData);
		
		console.log(r);
		
		if( r.length === 1 ) {
			r = r[0];
		} else {
			r = reduceArray(r);
		}
		
		//console.log(r);
		loadPersonMarkers(r);

	}
	
	/* 
		The keys in this need to be mapped 1-to-1 with the
		keys in the filter variable.
	*/
	filterMap = {
		followers: function(code) {
			var people = [];

			if( code === 0 ) return personData;

			for( i=0; i < personData.length; i++ ) {
				if( personData[i].followers > code ) {
					people.push(personData[i])
				} else {
					removePersonMarker(personData[i].id);
				}
			}
			return people;
		},
		
		college: function(code) {
			var people = [];
			
			if( code === 0 ) return personData;
			
			for( i=0; i < personData.length; i++ ) {
				if( personData[i].college == code ) {
					people.push(personData[i]);
				} else {
					removePersonMarker(personData[i].id);
				}
			}
			return people;
		},

		from: function(code) {
			var people = [];
			
			if( code === 0 ) return personData;
			
			for( i=0; i < personData.length; i++ ) {
				if( personData[i].from == code ) {
					people.push(personData[i]);
				} else {
					removePersonMarker(personData[i].id);
				}
			}
			console.log(people);
			return people;
		}
	} // filterMap

	// :: Public Function ::
	function resetFilter() {
		filter = {
			followers: 0,
			college: 0,
			from: 0
		}
	}
	
	/*
		== CURRENT LOCATION ==
	*/
	
	function getGeoSuccess(position) {
		var s = document.querySelector('#status');
		
		if (s.className == 'success') {
			// hack for FF   
			return;
		}
		s.className = 'success';
		
		var infoWindow = new google.maps.InfoWindow({ maxWidth: 400 });
		
		var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		
		var marker = new google.maps.Marker({
			position: latLng, 
			map: map,
			icon: 'img/blue-marker.png',
			animation: google.maps.Animation.DROP,
			title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
		});
		
		if( position.coords.accuracy > 1609.34 ) {
			accuracyImperial = Math.round( (position.coords.accuracy * 0.000621371) * 10)/10 + ' mi.';
		} else {
			accuracyImperial = Math.round( (position.coords.accuracy * 3.28084) * 10)/10 + ' ft.';
		}
		
		var content = 'My location<hr>' +
					'<strong>Latitude:</strong> ' + position.coords.latitude +
					'<br><strong>Longitude:</strong> ' + position.coords.longitude +
					'<br><strong>Accuracy:</strong> ' + accuracyImperial;
		
		google.maps.event.addListener(marker, 'click', (function (marker, content) {
			return function() {
				infoWindow.setContent(content);
				infoWindow.open(map, marker);
			}
		})(marker, content));
	}
	
	function getGeoError(msg) {
		var s = document.querySelector('#status');
		s.innerHTML = typeof msg == 'string' ? msg : 'Failed: ' + msg;
		s.className = 'fail';
		alert('Failed to locate your position. If you\'re on a device that should support geolocation (eg. iPad) it could be disabled in your privacy settings (Settings -> Privacy -> Location Services)');
	}
	
	// :: Public Function ::
	function getGeoLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(getGeoSuccess, getGeoError);
		} else {
			error('not supported');
		}
	}

	return {
		init: init,
		getPeople: loadPersonMarkers,
		filterCtrl: filterCtrl,
		resetFilter: resetFilter,
		getGeoLocation: getGeoLocation
	};
}();


$(function() {

	// takes ID of map in document
	myMap.init('map-canvas');

	// allows for both close buttons to function properly (listens to Google Maps close button)
	$('#map-canvas').on('click', '[title="Exit Street View"]', function() {
		myMap.closeSv();
	});

	$('.load-btn').on('click', function() {
		var $this = $(this);
		$('select').val(0);
		myMap.resetFilter();
		myMap.getPeople();

		if( $this.hasClass('is-success') ) {
			$this.removeClass('is-success').addClass('is-default');
		}
	});

	$('.followers-select').on('change', function(e) {
		//console.log(this.value);
		//console.log(e);
		myMap.filterCtrl('followers', this.value);
	});

	$('.college-select').on('change', function() {
		myMap.filterCtrl('college', this.value);
	});

	$('.from-select').on('change', function() {
		myMap.filterCtrl('from', this.value);
	});
	
	$('.get-location').on('click', function() {
		myMap.getGeoLocation();
		$(this).removeClass('is-primary').addClass('is-default');
	});
});





