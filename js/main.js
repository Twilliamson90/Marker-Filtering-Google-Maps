var myMap = function() {

	var	options = {
		zoom: 4,
		center: new google.maps.LatLng(38.810821,-95.053711),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	function init( settings ) {
		//console.log(settings);
		map = new google.maps.Map(document.getElementById( settings.idSelector ), options);
		markerLocation = settings.markerLocation;
		loadMarkers();
	}

	/*
		== MARKERS ==
	*/
	markers = {};
	markerList = [];

	function loadMarkers(person) {

		// optional argument of person
		var people = ( typeof person !== 'undefined' ) ? person : personData;

		var j = 1; // for lorempixel

		for( i=0; i < people.length; i++ ) {
			var person = people[i];

			// if its already on the map, dont put it there again
			if( markerList.indexOf(person.id) !== -1 ) continue;

			var lat = person.lat,
				lng = person.lng,
				markerId = person.id;

			var infoWindow = new google.maps.InfoWindow({
				maxWidth: 400
			});

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng( lat, lng ),
				title: person.name,
				markerId: markerId,
				icon: markerLocation,
				map: map
			});

			markers[markerId] = marker;
			markerList.push(person.id);

			if( j > 10 ) j = 1; //temp for lorempixel
			var content = ['<div class="iw"><img src="http://lorempixel.com/90/90/people/', j, '" width="90" height="90">',
				'<div class="iw-text"><strong>', person.name, '</strong><br>Age: ', person.age,
				'<br>Followers: ', person.followers, '<br>College: ', person.college, '</div></div>'].join('');
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

	// default all filters off
	var filter = {
		followers: 0,
		college: 0,
		from: 0
	}
	var filterMap;

	function filterCtrl(filterType, value) {
		// result array
		var results = [];

		if( isInt(value) ) {
			filter[filterType] = parseInt(value);
		} else {
			filter[filterType] = value;
		}
		
		for( k in filter ) {
			if( !filter.hasOwnProperty(k) && !( filter[k] !== 0 ) ) {
				// all the filters are off
				loadMarkers();
				return false;
			} else if ( filter[k] !== 0 ) {
				// call filterMap function and append to r array
				results.push( filterMap[k]( filter[k] ) );
			} else {
				// console.log(k); // fail silently
			}
		}

		if( filter[filterType] === 0 ) results.push( personData );
		
		/*
			if there is 1 array (1 filter applied) set it,
			otherwise find markers that are common to every results array (included in every filter)
		*/
		if( results.length === 1 ) {
			results = results[0];
		} else {
			results = reduceArray( results );
		}
		
		loadMarkers( results );

	}
	
	/* 
		The keys in this need to be mapped 1-to-1 with the
		keys in the filter variable.
	*/
	filterMap = {
		followers: function( value ) {
			return filterIntsLessThan('followers', value);
		},
		
		college: function( value ) {
			return filterByString('college', value);
		},

		from: function( value ) {
			return filterByString('from', value);
		}
	} // filterMap

	function filterByString( dataProperty, value ) {
		var people = [];

		for( var i=0; i < personData.length; i++ ) {
			var person = personData[i];
			if( person[dataProperty] == value ) {
				people.push( person );
			} else {
				removePersonMarker( person.id );
			}
		}
		return people;
	} // filterByString()

	function filterIntsLessThan( dataProperty, value ) {
			var people = [];

			for( var i=0; i < personData.length; i++ ) {
				var person = personData[i];
				if( person[dataProperty] > value ) {
					people.push( person )
				} else {
					removePersonMarker( person.id );
				}
			}
			return people;
	} // filterIntsLessThan()

	// :: Public Function ::
	function resetFilter() {
		filter = {
			followers: 0,
			college: 0,
			from: 0
		}
	}

	return {
		init: init,
		loadMarkers: loadMarkers,
		filterCtrl: filterCtrl,
		resetFilter: resetFilter
	};
}();


$(function() {

	var mapConfig = {
		idSelector: 'map-canvas',
		markerLocation: 'img/red-fat-marker.png'
	}

	myMap.init( mapConfig );

	$('.load-btn').on('click', function() {
		var $this = $(this);
		// reset everything
		$('select').val(0);
		myMap.resetFilter();
		myMap.loadMarkers();

		if( $this.hasClass('is-success') ) {
			$this.removeClass('is-success').addClass('is-default');
		}
	});

	$('.followers-select').on('change', function() {
		myMap.filterCtrl('followers', this.value);
	});

	$('.college-select').on('change', function() {
		myMap.filterCtrl('college', this.value);
	});

	$('.from-select').on('change', function() {
		myMap.filterCtrl('from', this.value);
	});
});





