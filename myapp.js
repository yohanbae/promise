var myApp = angular.module('myApp', ['ui.router','ui.router.state.events']);


myApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('welcome', {
			url:'/',
			templateUrl:'welcome.html',
			controller:'welcomeCtrl'
		})
		.state('main',{
			url:'/main',
			templateUrl:'main.html',
			controller:'mainCtrl'
		})	
		.state('template',{
			url:'/template',
			templateUrl:'template.html',
			controller:'tempCtrl'
		});													
		$urlRouterProvider.otherwise('/');

}]);


myApp.controller('mainCtrl', ['$scope', 'myService', function($scope, myService){
	$scope.hello = 'yohanison';

	
	//MOCK DATABASE 
	/*
	var events = [
		{'code':'2018810', 'events':[{'eve':'hello', 'cur':1, 'goal':1}, {'eve':'theEvent', 'cur':0, 'goal':1}] },
		{'code':'2018815', 'events':[{'eve':'hoo', 'cur':0, 'goal':1}, {'eve':'finalMan', 'cur':0, 'goal':1}] }
	];*/
	if(localStorage.getItem('PROMISE')){
		var events = JSON.parse(localStorage.getItem('PROMISE'));
	}else{
		var events = [];
	}
	console.log(events);


	// SETUP
	$scope.thisYear = myService.getYear();
	$scope.thisMonth = myService.getMonth();
	$scope.thisMonthName = myService.getMonthName($scope.thisMonth);
	$scope.totalDays = getDaysInMonth($scope.thisMonth, $scope.thisYear);
	$scope.todays = [];

	$scope.yearPicked =$scope.thisYear;
	$scope.monthPicked=$scope.thisMonth;
	$scope.dayPicked=myService.getToday();
	$scope.dayName="d";

	$scope.newEvent="";
	$scope.eventPicked="";
	$scope.eventsPicked = [];

	$scope.currentDayCode ="";
	$scope.currentPickedDayEvents="";
	$scope.currentPickedEvent=0;
	$scope.currentNote = "";

	var thisMonth = $scope.thisMonth;
	if($scope.thisMonth < 10){ thisMonth = "0"+$scope.thisMonth; }
	$scope.currentMonthCode = $scope.thisYear +""+ thisMonth;
	$scope.monthNote ="";

	$scope.newEventGoal = 1;
	$scope.dayPercent = 0;

	$scope.noteDay=[];
	$scope.templates=[];

	designDays();
	autoStart($scope.thisYear, $scope.thisMonth, $scope.dayPicked);
	console.log($scope.templates);
	// SETUP DONE





	function getDaysInMonth(month, year) {
		return new Date(year, month, 0).getDate();
	};

	$scope.prevMonth = function(){
		if($scope.thisMonth == 1){
			$scope.thisMonth = 12;
			$scope.thisYear = $scope.thisYear - 1;
			$scope.totalDays = getDaysInMonth($scope.thisMonth, $scope.thisYear);
		}else{
			$scope.thisMonth = $scope.thisMonth - 1;
			$scope.totalDays = getDaysInMonth($scope.thisMonth, $scope.thisYear);
		}
		var thisMonth = $scope.thisMonth;
		if($scope.thisMonth < 10){ thisMonth = "0"+$scope.thisMonth; }
		$scope.currentMonthCode = $scope.thisYear+"" + thisMonth;

		designDays();
		get_current_month_note();
	}

	$scope.nextMonth = function(){
		if($scope.thisMonth < 12){
			$scope.thisMonth = $scope.thisMonth + 1;			
			$scope.totalDays = getDaysInMonth($scope.thisMonth, $scope.thisYear);
		}else{
			$scope.thisMonth = 1;
			$scope.thisYear = $scope.thisYear + 1;
			$scope.totalDays = getDaysInMonth($scope.thisMonth, $scope.thisYear);
		}

		var thisMonth = $scope.thisMonth;
		if($scope.thisMonth < 10){ thisMonth = "0"+$scope.thisMonth; }
		$scope.currentMonthCode = $scope.thisYear +""+ thisMonth;

		designDays();
		get_current_month_note();
	}

	function get_current_month_note(){
		newCode = $scope.currentMonthCode;
		var obj = events.find(function (obj) { return obj.code == newCode; });
		if(obj){
			$scope.monthNote = obj.mnote;
		}else{
			$scope.monthNote = "";
		}
	}


	function designDays(){
		$scope.todays = [];
		var date = new Date();
		var firstDay = new Date($scope.thisYear, $scope.thisMonth - 1, 1);
		var getFirstDay = firstDay.getDay();

		var lastDay = new Date($scope.thisYear, $scope.thisMonth, 0);
		var getLastDay = lastDay.getDay();
		var getLastDayLeft = 6 - getLastDay;

		for(j=1; j<=getFirstDay; j++){
			var emptyDay = {
				'today':0,
				'name':0,
				'code':0,
				'events':[]
			}
			$scope.todays.push(emptyDay);
		}

		console.log($scope.thisYear, $scope.thisMonth);

		for(i=1; i<=$scope.totalDays; i++){

			var j = i;
			var tM = $scope.thisMonth;
			if(i <10){ j= "0"+i; }
			if($scope.thisMonth < 10){ tM = "0"+$scope.thisMonth; }
			var dayCode = $scope.thisYear+ ""+ tM +""+ j ;

			var percent = 0;
			var obj = events.find(function (obj) { return obj.code == dayCode; });
			var totalGoal = 0; var totalCur = 0;
			if(obj){
				// GET PERCENT
				for (val of obj.events) {
					totalGoal += val.goal;
					totalCur += val.cur;
				}
				//console.log(obj.events[0].goal);
			}else{
				obj = "";
			}

			var obj2 = events.find(function (obj) { return obj.code == dayCode; });
			if(obj2){
				for(val of obj2.templates){
					totalGoal += val.goal;
					totalCur += val.cur;
				}
			}

			var thePercent = totalCur / totalGoal * 100;
			percent = Math.ceil(thePercent);


			//console.log(obj);
			var dday = {
				'today': i,
				'name': 'Yohan',
				'code': dayCode,
				'events':obj.events,
				'percent':percent,
				'note':"",
				'templates':[],
				'temp_status': false
			};
			$scope.todays.push(dday);
		}

		for(l=1; l<=getLastDayLeft; l++){
			var emptyDay = {
				'today':0,
				'name':0,
				'code':0,
				'events':[]
			}
			$scope.todays.push(emptyDay);
		}
		$scope.thisMonthName = myService.getMonthName($scope.thisMonth);
		get_current_month_note();

	}//CLOSE







	$scope.handleDay = function(year, month,day){
		if(day==0){ // CHECK if the DATE available
			// do nothing
		}else{
			$scope.yearPicked = year;
			$scope.monthPicked = month;
			$scope.dayPicked = day;

			var mP = $scope.monthPicked;
			var dP = $scope.dayPicked;
			if($scope.monthPicked < 10){
				mP = "0"+$scope.monthPicked;
			}
			if($scope.dayPicked < 10){
				dP = "0"+$scope.dayPicked;
			}
			$scope.currentDayCode = $scope.yearPicked + "" + mP + "" + dP;

			// GET DAY #
			var dateStr = mP +"/"+dP+"/"+$scope.yearPicked;
			var d = new Date(dateStr);
			$scope.dayNumPicked = d.getDay();
			$scope.dayName = myService.getDayName($scope.dayNumPicked);


			//GET EVENT INFORMATIONS
			var obj = events.find(function (obj) { return obj.code == $scope.currentDayCode; });
			if(obj){
				$scope.currentPickedDayEvents = obj.events;			
				
				$scope.currentNote = obj.note;
			}else{
				$scope.currentPickedDayEvents = "";
				$scope.dayPercent = 0;				
				$scope.currentNote = "";
			}
			$scope.newEventGoal = 1;

			//GET TEMPLATE INFORMATIONS
			var templates = JSON.parse(localStorage.getItem('PROMISETEMP'));

			var obj2 = events.find(function (obj) { return obj.code == $scope.currentDayCode; });
			if(obj2){
				// request for the obj2.template
				//check if obj has templates
				if(obj2.templates.length>0){
					$scope.templates = obj2.templates;
				}else{
					if(templates && templates[$scope.dayNumPicked].events.length >0){
						console.log(templates[$scope.dayNumPicked].events);
						$scope.templates = templates[$scope.dayNumPicked].events;
					}else{
						$scope.templates = "";
					}
				}
			}else{ // if theres no object, then demand for template info
				if(templates && templates[$scope.dayNumPicked].events.length >0){
					console.log(templates[$scope.dayNumPicked].events);
					$scope.templates = templates[$scope.dayNumPicked].events;
				}else{
					$scope.templates = "";
				}
			}
			if(obj){$scope.dayPercent = getPercent();}


		}
	}
			function autoStart(year, month,day){ //SAME CODE AVOBE
					if(day==0){ // CHECK if the DATE available
						// do nothing
					}else{
						$scope.yearPicked = year;
						$scope.monthPicked = month;
						$scope.dayPicked = day;

						var mP = $scope.monthPicked;
						var dP = $scope.dayPicked;
						if($scope.monthPicked < 10){
							mP = "0"+$scope.monthPicked;
						}
						if($scope.dayPicked < 10){
							dP = "0"+$scope.dayPicked;
						}
						$scope.currentDayCode = $scope.yearPicked + "" + mP + "" + dP;

						// GET DAY #
						var dateStr = mP +"/"+dP+"/"+$scope.yearPicked;
						var d = new Date(dateStr);
						$scope.dayNumPicked = d.getDay();
						$scope.dayName = myService.getDayName($scope.dayNumPicked);

						//GET EVENT INFORMATIONS
						var obj = events.find(function (obj) { return obj.code == $scope.currentDayCode; });
						if(obj){
							$scope.currentPickedDayEvents = obj.events;			
							
							$scope.currentNote = obj.note;
						}else{
							$scope.currentPickedDayEvents = "";
							$scope.dayPercent = 0;				
							$scope.currentNote = "";
						}
						$scope.newEventGoal = 1;

						//GET TEMPLATE INFORMATIONS
						var templates = JSON.parse(localStorage.getItem('PROMISETEMP'));

						var obj2 = events.find(function (obj) { return obj.code == $scope.currentDayCode; });
						if(obj2){
							// request for the obj2.template
							//check if obj has templates
							if(obj2.templates.length>0){
								$scope.templates = obj2.templates;
							}else{
								if(templates && templates[$scope.dayNumPicked].events.length >0){
									console.log(templates[$scope.dayNumPicked].events);
									$scope.templates = templates[$scope.dayNumPicked].events;
								}else{
									$scope.templates = "";
								}
							}
						}else{ // if theres no object, then demand for template info
							if(templates && templates[$scope.dayNumPicked].events.length >0){
								console.log(templates[$scope.dayNumPicked].events);
								$scope.templates = templates[$scope.dayNumPicked].events;
							}else{
								$scope.templates = "";
							}
						}
						if(obj){$scope.dayPercent = getPercent();}


					}
				}

	function getPercent(){
		var total = $scope.currentPickedDayEvents.length;
		var totalNum = 0;
		var curNum = 0;

		if(total == 0){
			return 0;
		}else{
			for(i=0; i<total; i++){
				totalNum += $scope.currentPickedDayEvents[i].goal;
				curNum += $scope.currentPickedDayEvents[i].cur;			
			}
		}

		//$scope.templates
		
		var temp_total = $scope.templates.length;
		if(temp_total>0){
			for(i=0; i<temp_total; i++){
				totalNum += $scope.templates[i].goal;
				curNum += $scope.templates[i].cur;
			}
		}
		
		var thePercent = curNum / totalNum * 100;
		thePercent = Math.ceil(thePercent);
		return thePercent;			

	}


	$scope.handleEvent = function(year, month, day, index){
		/*
		var dayCode = year+""+month+""+day;
		$scope.currentDayCode = dayCode;
		$scope.currentPickedEvent = index;
		var obj = events.find(function (obj) { return obj.code == dayCode; });
		var theEvent = obj.events[index].eve;
		$scope.eventPicked = theEvent;*/
		console.log('handleEvent');
	}

	$scope.handleEventUpdate = function(idx){
		var index = events.map(function (obj) { return obj.code; }).indexOf($scope.currentDayCode);
		events[index].events[idx].eve = $scope.currentPickedDayEvents[idx].eve;
		localStorage.setItem('PROMISE', JSON.stringify(events));
		console.log('event updated');
		designDays();
		$scope.handleDay($scope.yearPicked, $scope.monthPicked, $scope.dayPicked);
	}

	$scope.handleEventDelete = function(idx){
		console.log($scope.currentDayCode);
		var index = events.map(function (obj) { return obj.code; }).indexOf($scope.currentDayCode);
		events[index].events.splice(idx,1);
		localStorage.setItem('PROMISE', JSON.stringify(events));		
		designDays();
		$scope.handleDay($scope.yearPicked, $scope.monthPicked, $scope.dayPicked);
	}


	$scope.handleAddEvent = function(){
		var mP = $scope.monthPicked;
		var dP = $scope.dayPicked;
		if($scope.monthPicked < 10){
			mP = "0"+$scope.monthPicked;
		}
		if($scope.dayPicked < 10){
			dP = "0"+$scope.dayPicked;
		}
		var newCode = $scope.yearPicked + "" + mP + "" + dP;

		var obj = events.find(function (obj) { return obj.code == newCode; });
		if(obj){ // When there's same day already exist
			var index = events.map(function (obj) { return obj.code; }).indexOf(newCode);
			var newEvent = 
				{'eve': $scope.newEvent,'cur':0, 'goal':$scope.newEventGoal };		
			events[index].events.push(newEvent);
			localStorage.setItem('PROMISE', JSON.stringify(events));
		}else{ // if there's no event on the day yet
			var newEvent = 
			{'code':newCode, 'events':[{'eve':$scope.newEvent, 'cur':0, 'goal':$scope.newEventGoal}], 'percent':0, 'note':"", 'templates':[], 'temp_status':false};
			events.push(newEvent);
			localStorage.setItem('PROMISE', JSON.stringify(events));			
		}

		designDays();
		$scope.handleDay($scope.yearPicked, $scope.monthPicked, $scope.dayPicked);
		console.log(newEvent);
		$scope.newEvent = "";
		$scope.newEventGoal = 1;	
	}

	$scope.handleNoteUpdate =function(){
		var mP = $scope.monthPicked;
		var dP = $scope.dayPicked;
		if($scope.monthPicked < 10){
			mP = "0"+$scope.monthPicked;
		}
		if($scope.dayPicked < 10){
			dP = "0"+$scope.dayPicked;
		}
		var newCode = $scope.yearPicked + "" + mP + "" + dP;
		var percent = 0;
		var obj = events.find(function (obj) { return obj.code == newCode; });
		if(obj){
			var index = events.map(function (obj) { return obj.code; }).indexOf(newCode);
			events[index].note = $scope.currentNote;
			localStorage.setItem('PROMISE', JSON.stringify(events));
		}else{
			var newEvent = 
			{'code':newCode, 'events':[], 'percent':percent, 'note':$scope.currentNote, 'templates':[], 'temp_status':false};
			events.push(newEvent);
			localStorage.setItem('PROMISE', JSON.stringify(events));				
		}
		designDays();
		$scope.handleDay($scope.yearPicked, $scope.monthPicked, $scope.dayPicked);
	}


	$scope.handleMonthNote = function(){
		var newCode = $scope.currentMonthCode;

		var obj = events.find(function (obj) { return obj.code == newCode; });
		if(obj){ // When there's same day already exist
			var index = events.map(function (obj) { return obj.code; }).indexOf(newCode);
			events[index].mnote = $scope.monthNote;
			localStorage.setItem('PROMISE', JSON.stringify(events));
		}else{
			var newMonth =
			{
				'code':newCode,
				'mnote':$scope.monthNote
			}
			events.push(newMonth);
			localStorage.setItem('PROMISE', JSON.stringify(events));			
		}
		designDays();
	}

/////////////
	//HANDLE TEMPLATE
	$scope.handleTempUpdate = function(){
		//make sure, change 'template statue to TRUE'
		var obj = events.find(function (obj) { return obj.code == $scope.currentDayCode; });
		console.log(obj, 'haha');
		if(obj){			
			console.log('okay theres event');
			var index = events.map(function (obj) { return obj.code; }).indexOf($scope.currentDayCode);
			if(obj.templates.length>0){ // check template exist
				events[index].templates = $scope.templates;
				console.log('exist && updated');
				localStorage.setItem('PROMISE', JSON.stringify(events));
				// update the template
			}else{ //if no template yet, then add to the tempalte.
				console.log('no');
				events[index].templates=$scope.templates;
				localStorage.setItem('PROMISE', JSON.stringify(events));
			}			
		}else{
			console.log('no event yet. must create event first');
			var newEvent = 
			{'code':$scope.currentDayCode, 'events':[], 'percent':0, 'note':"", 'templates':[], 'temp_status':false};
			newEvent.templates = $scope.templates;			
			console.log(newEvent);
			events.push(newEvent);
			localStorage.setItem('PROMISE', JSON.stringify(events));			

			// create the event onthe day
		}
		designDays();
		$scope.handleDay($scope.yearPicked, $scope.monthPicked, $scope.dayPicked);
	}

	$scope.handleTempRemove = function(idx){
		var index = events.map(function (obj) { return obj.code; }).indexOf($scope.currentDayCode);
		events[index].templates.splice(idx,1);
		localStorage.setItem('PROMISE', JSON.stringify(events));		
		designDays();
		$scope.handleDay($scope.yearPicked, $scope.monthPicked, $scope.dayPicked);

	}


	// HANDLE READINGS
	$scope.getNotes = function(){
		var results = [];

		events.forEach(x => {if (x.note !=null && x.note.length > 0) results.push(x)});
		results.sort(function(a, b){
			return b.code - a.code
		});
		results = results.splice(0,7);
		$scope.noteDay = results;
		console.log($scope.noteDay);
	}
	$scope.getNotesTw = function(){
		var results = [];

		events.forEach(x => {if (x.note !=null && x.note.length > 0) results.push(x)});
		results.sort(function(a, b){
			return b.code - a.code
		});
		results = results.splice(0,20);
		$scope.noteDay = results;
		console.log($scope.noteDay);
	}

	$scope.getMonthNotes = function(){
		var results = [];

		events.forEach(x => {if (x.mnote !=null && x.mnote.length > 0) results.push(x)});
		results.sort(function(a, b){
			return b.code - a.code
		});
		results = results.splice(0,12);
		$scope.noteDay = results;
		console.log($scope.noteDay);
	}

}]);



myApp.controller('tempCtrl', ['$scope', 'myService', '$state', function($scope, myService, $state){
	$scope.msg="";
	if(localStorage.getItem('PROMISETEMP')){
		var templates = JSON.parse(localStorage.getItem('PROMISETEMP'));
	}else{
		var templates = [
			{'code': 0, 'name':'SUNDAY', 'events':[
				{'eve':'Sunday Job', 'cur':0,'goal':1}
			]},
			{'code': 1, 'name':'MONDAY', 'events':[
				{'eve':'Monday Work', 'cur':0,'goal':1}
			]},
			{'code': 2, 'name':'TUESDAY', 'events':[
				{'eve':'Tuesday Task', 'cur':0,'goal':1}
			]},
			{'code': 3, 'name':'WEDSNDAY', 'events':[
				{'eve':'WEDSNDAY Job', 'cur':0,'goal':1}
			]},
			{'code': 4, 'name':'THURSDAY', 'events':[
				{'eve':'Thursday Work', 'cur':0,'goal':1}
			]},
			{'code': 5, 'name':'FRIDAY', 'events':[
				{'eve':'Friday Task', 'cur':0,'goal':1}
			]},
			{'code': 6, 'name':'SATURDAY', 'events':[
				{'eve':'Saturday Job', 'cur':0,'goal':1}
			]},			
		];
	}
	console.log(templates);

	$scope.templates = templates;

	$scope.handleAddEvent = function(day){
		console.log(day);
		var newEvent = {'eve':'', 'cur':0, 'goal':1}
		$scope.templates[day].events.push(newEvent);
		$scope.msg ="Please name the new task";
	}

	$scope.handleSubmit = function(){
		localStorage.setItem('PROMISETEMP', JSON.stringify($scope.templates));
		$scope.msg="The template saved";
	}

	$scope.handleRemove = function(day, idx){
		console.log(day, idx);
		$scope.templates[day].events.splice(idx,1);
		$scope.msg = "The item removed";
	}


}]);


myApp.controller('welcomeCtrl', ['$scope', 'myService', '$state','$location', function($scope, myService, $state, $location){
	if(localStorage.getItem('PROMISE')){
		$location.path('/main');
	}

	$scope.start = function(){
		$location.path('/main');
	}

}]);


myApp.service('myService', function(){
	var d = new Date();	
	return{
		getYear:function(){
			var thisYear = d.getFullYear();
			return thisYear;
		},
		getMonth:function(){
			var thisMonth = d.getMonth() + 1;
			return thisMonth;
		},
		getToday:function(){
			var today = d.getDate();
			return today;
		},
		getDayName:function(day){
			var name= ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDSNDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
			return name[day];
		},
		getMonthName:function(month){
			var name =
				['month','JANUARY', 'FEBURARY', 'MARCH', 'APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
				];
			return name[month];
		}

	}

});


// DELETE FUNCTION
// and...re-order the days with the day name + month
// need to save the file in the local storage
