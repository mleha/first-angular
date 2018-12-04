(function() {
 
  'use strict';
 
 
 
 var myApp=
  angular
  .module('app', ['ngStorage'])
  .controller('AppController', ['$scope', '$compile','$http','$localStorage','$filter',function($scope,$compile,$http,$localStorage,$filter) {
		$scope.sections = { 'fav':'Любимые',
							'all':'Все',
							'del':'Удаленные'};
							
		//console.log($scope.sections);
		$scope.search = {};
		$scope.search.cat='all';
		
		$scope.page = window.location.hash.substr(1) || 'all';
		//$scope.stored = $localStorage.myvar || 1;
		$scope.sectVar = $scope.page;//$localStorage.sectVar || 'all';
		$scope.localEmojis =  $localStorage.emojis || [];
		
		$scope.stored++;
		$scope.section = $scope.sections[$scope.page];

		$http({
			method : "GET",
			url : "https://api.github.com/emojis"
		}).then(function mySuccess(response) {
			$scope.emojis = response.data;
			//console.log($scope.emojis);
			updateEmojis( response.data);
			console.log($scope);
		});
		
		function updateEmojis(emojis){
			for(var id in emojis){
				var found = $filter('getById')($scope.localEmojis, id);
				
				if (found != undefined){
					//console.log(found);
					found.url=emojis[id];
				}else{
					$scope.localEmojis.push({'id':id,'url':emojis[id], 'cat':'all'});
				}
			}
			$localStorage.emojis = $scope.localEmojis;
		}
		
		//function drawEmojis(){
		//	var table = angular.element(document.querySelector('#tablebody'));
		//	table.html('<tr ng-repeat="(id,emoji) in localEmojis | fsearch">\
		//			<td>{{ id }}</td>\
		//			<td>{{ emoji.url }}</td>\
		//			<td><img class="preview" src="{{ emoji.url }}"></td>\
		//			<td>actions</td>\
		//		</tr>');
		//	$compile(table.contents())($scope);
		//
		//}
		//$localStorage.myvar=$scope.stored;
		
		$scope.selectSection = function (section){
			$scope.section=$scope.sections[section];
			$scope.sectVar=section;
			//$localStorage.sectVar=section;
		}
		
		$scope.func2 = function (e){
			//alert(1);
			$http({
				method : "GET",
				url : "https://api.github.com/emojis"
			}).then(function mySuccess(response) {
				$scope.emojis = response.data;

			var currentElement = angular.element(document.querySelector('#tablebody'));// angular.element('#tid');
			
			currentElement.html("<button ng-click='func2()'>new click</button>\
			<div>{{ tvar }}</div>\
			<table>\
			  <tr>\
			 <th>A</th>\
			 <th>N</th>\
			  </tr>\
			  <tr ng-repeat=\"(id,nn) in tvar\">\
			 <td>{{ id }}</td>\
			 <td>{{ nn }}</td>\
			  </tr>\
			</table>\
			");
			$compile(currentElement.contents())($scope);
				
				
			}, function myError(response) {
				$scope.tvar = response.statusText;
			});
			
		};
		
		$scope.MyClick = function (e){
			//console.log(e);
			//console.log($this);
			//console.log(this); // $scope
			//alert(1);
			var currentElement = angular.element(document.querySelector('#tid'));// angular.element('#tid');
			
			currentElement.html("<button ng-click='func2()'>new click</button>\
			<div>{{ tvar }}</div>\
			");
			
			$compile(currentElement.contents())($scope);
			
			//currentElement.html();
			
		};
		
		
		$scope.changeUsername = function(username) {
		  $scope.test = username;
		};
	
  }]);
  
	myApp.filter('category', function() {
	  return function(input) {
		console.log($scope.page + ' = ?? = ' + input.cat);
		return input.cat==$scope.page;
	  }
	});
	
	myApp.filter('getById', function() {
	  return function(input, id) {
	  
		for(var arr_id in input){
			if (input[arr_id].id==id){
				return input[arr_id];
			}
		}
		return undefined;
	  }
	});
 
})();