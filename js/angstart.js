(function() {
 
  'use strict';
 
 
 
 var myApp=
  angular
  .module('app', ['ngStorage'])
  .controller('AppController', ['$scope', '$compile','$http','$localStorage','$filter',function($scope,$compile,$http,$localStorage,$filter) {
		
		$scope.init = function (){
			$scope.sections = { 'fav':{'name':'Любимые'},
								'all':{'name':'Все'},
								'del':{'name':'Удаленные'}};
			
			// for(var sect in $scope.sections){
				// $scope.sections[sect].css = {};
				// $scope.sections[sect].css.data="btn-info";
			// }
			
			pushCSS_ToObject($scope.sections, "btn-info");
			
			//console.log($scope.sections);
			$scope.search = {};
			
			$scope.page = window.location.hash.substr(1) || 'all';
			$scope.sections[$scope.page].css.data="btn-warning";
			$scope.section = $scope.sections[$scope.page];
			//$scope.sectVar = $scope.page;//$localStorage.sectVar || 'all';
			$scope.localEmojis =  $localStorage.emojis || [];
			
			//$scope.stored++;

			$http({
				method : "GET",
				url : "https://api.github.com/emojis"
			}).then(function mySuccess(response) {
				$scope.emojis = response.data;
				//console.log($scope.emojis);
				updateEmojis( response.data);
				//console.log($scope);
			});		
		}
		
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
			pushCSS_ToObject($scope.localEmojis, "img-transparent");
		}
		
		function pushCSS_ToObject(arr,data,q=null){
			angular.forEach(arr,function(item){
				if (item.css == undefined) item.css = {'data':data} 
				
			});
		}
		
		$scope.makeFavorive = function(emoji){
			//console.log(emoji);
			emoji.cat="fav";
			emoji.css.data="img-no-transparent";
		}
		
		$scope.check_visible = function(button){
			//console.log(button);
			
			if (button=="fav" && $scope.page=="all") return "img-visible";
			if (button=="restore" && $scope.page=="del") return "img-visible";
			if (button=="del" && $scope.page!="del") return "img-visible";
			
			return "img-hidden";
		}
		
		$scope.restoreEmoji = function(emoji){
			emoji.cat="all";
			emoji.css.data="img-transparent";
		}
		
		$scope.delEmoji = function(emoji){
			//console.log(emoji);
			if (emoji.cat!="del"){
				emoji.cat="del";
				emoji.css.data="img-no-transparent";
			}else{
				emoji.cat="all";
				emoji.css.data="img-transparent";
			}
		}
		
		$scope.selectSection = function (section){
			$scope.page=section;
			$scope.section=$scope.sections[section];
			angular.forEach($scope.sections,function(item){ item.css.data = "btn-info"; });
			$scope.sections[section].css.data="btn-warning";
		}

		
		$scope.changeUsername = function(username) {
		  $scope.test = username;
		};
	
	
		$scope.init();
	
  }]);
  
	myApp.filter('category', function() {
	  return function(items,scope) {
		var filtered=[];
		for(var n in items){
			var item = items[n];
			//console.log(scope.page + ' = ?? = ' + item.cat);
			switch (scope.page){
				case "all":
					if(item.cat=="all" || item.cat=="fav")filtered.push(item);
				break;
				case "fav":
				case "del":
					if(item.cat==scope.page)filtered.push(item);
				break;
			}
		}
		return filtered;
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