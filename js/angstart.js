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
			
			pushCSS_ToObject($scope.sections, "btn-info");
			
			//console.log($scope.sections);
			$scope.search = {};
			$scope.search.id="";
			//$scope.found = [];
			$scope.imgdiv = 'img-hidden';
			$scope.img_div_style = '';
			
			$scope.page = window.location.hash.substr(1) || 'all';
			//console.log($scope.page);
			if ($scope.page!="fav" && $scope.page != "del") {
				$scope.page="all";
				window.location.hash="#all";
			}
			$scope.sections[$scope.page].css.data="btn-warning";
			$scope.section = $scope.sections[$scope.page];
			//$scope.sectVar = $scope.page;//$localStorage.sectVar || 'all';
			$scope.localEmojis =  $localStorage.emojis || [];
			$scope.found = $scope.localEmojis;
			//$scope.stored++;

			$http({
				method : "GET",
				url : "https://api.github.com/emojis"
			}).then(function mySuccess(response) {
				$scope.emojis = response.data;
				//console.log($scope.emojis);
				updateEmojis( response.data);
				//console.log($scope);
				$scope.do_search();
			});		
		}
		
		//=======================================================
		//    service functions
		//------------------------------------------------		
		function updateEmojis(emojis){
			for(var id in emojis){
				var found = $filter('getById')($scope.localEmojis, id);
				
				if (found != undefined)
					found.url=emojis[id];
				else
					$scope.localEmojis.push({'id':id,'url':emojis[id], 'cat':'all'});
			}
			$localStorage.emojis = $scope.localEmojis;
			pushCSS_ToObject($scope.localEmojis, "img-transparent");
		}
		
		function pushCSS_ToObject(arr,data){
			angular.forEach(arr,function(item){
				if (item.css == undefined) item.css = {'data':data} 
			});
		}
		//=======================================================
		//    events/listeners
		//------------------------------------------------
		$scope.check_visible = function(button){
			if (button=="fav" && $scope.page=="all") return "img-visible";
			if (button=="restore" && $scope.page=="del") return "img-visible";
			if (button=="del" && $scope.page!="del") return "img-visible";
			return "img-hidden";
		}
		$scope.selectSection = function (section){
			$scope.page=section;
			$scope.section=$scope.sections[section];
			angular.forEach($scope.sections,function(item){ item.css.data = "btn-info"; });
			$scope.sections[section].css.data="btn-warning";
			$scope.do_search();
		}
		$scope.changeUsername = function(username) {
		  $scope.test = username;
		}
		$scope.img_move = function(img,event) {
			$scope.img_div_style = 'left:'+(event.clientX+3)+'px;top:'+(event.clientY+3)+'px';
		}
		$scope.img_over = function(img) {
			$scope.imgdiv='img-visible';
			$scope.fullimg=img.emoji.url;
		}
		$scope.img_out = function() {
			$scope.imgdiv='img-hidden';
		}
		$scope.do_search = function(){
			//console.log($scope.search.id);
			var filterd =  $filter('category')($scope.localEmojis, $scope);
			//console.log(filterd);
			$scope.found = $filter('searchById')(filterd, $scope.search.id);
			
			//console.log($scope.found);
			
			$scope.pagecount = Math.ceil($scope.found.length/10);
			$scope.curpagen = 1;
			$scope.pages = [];
			$scope.pagesn = [];
			
			var onepage=[];
			var n=0;
			var pagen=0;
			for(var i in $scope.found){
				if(n==0){
					$scope.pagesn.push(pagen);
				}
			
				var item = $scope.found[i];
				n++;
				onepage.push(item);
				if(n==10){
					$scope.pages.push(onepage);
					n=0;
					onepage=[];
					//if (pagen<10) $scope.pagesn.push(pagen);
					pagen++;
				}
			}
			if (n>0){
				$scope.pages.push(onepage);
				//pagen++;
			}
			
			//$scope.pagesn = _.range(1, pagecount + 1);
			$scope.curpage = $scope.pages[0];
			$scope.setPage(0);
			console.log($scope.pagesn);
		}
		$scope.setPage = function(page){
			console.log(page);
			if (page < 0 || page > $scope.pagecount-1) return;
			$scope.curpagen = page;
			if($scope.pagecount>10){
				var start = $scope.curpagen-5; 
				if (start < 0 ) start=0;
				var end = start + 10;
				
				if( end > $scope.pagecount ){
					end = $scope.pagecount;
					start = $scope.pagecount - 10;
				}
			}else{
				start=0;
				end = $scope.pagecount;
			}
			$scope.pagesn=[];
			for(var i = start;i<end;i++){
				$scope.pagesn.push(i);
			}
			console.log($scope.pagesn);
			$scope.curpage = $scope.pages[page];
			
		}
		
		//================================================
		//    emoji actions
		//------------------------------------------------
		$scope.makeFavorive = function(emoji){
			emoji.cat="fav";
			emoji.css.data="img-no-transparent";
		}
		
		$scope.restoreEmoji = function(emoji){
			emoji.cat="all";
			emoji.css.data="img-transparent";

			var old_page = $scope.curpagen;
			$scope.do_search();
			if(old_page == $scope.pagecount) old_page = $scope.pagecount-1;
			$scope.setPage(old_page);
		}
		
		$scope.delEmoji = function(emoji){
			//console.log(emoji);
			if (emoji.cat=="all"){
				emoji.cat="del";
				emoji.css.data="img-no-transparent";
			}else if (emoji.cat=="fav"){
				emoji.cat="all";
				emoji.css.data="img-transparent";
			}
			
			var old_page = $scope.curpagen;
			$scope.do_search();
			if(old_page == $scope.pagecount) old_page = $scope.pagecount-1;
			$scope.setPage(old_page);
		}
		//================================================
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
	
	myApp.filter('searchById', function() {
	  return function(input, id) {
		var filtered=[];
		for(var arr_id in input){
			if (input[arr_id].id.indexOf(id) !== -1){
				filtered.push(input[arr_id])
			}
		}
		return filtered;
	  }
	});	
 
})();