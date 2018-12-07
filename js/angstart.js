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
			
			$scope.search = {};
			$scope.search.id="";
			$scope.img_div_class = 'img-hidden';
			$scope.img_div_style = '';
			$scope.page = window.location.hash.substr(1) || 'all';
			if ($scope.page!="fav" && $scope.page != "del") {
				$scope.page="all";
				window.location.hash="#all";
			}
			$scope.sections[$scope.page].css.data="btn-warning"; // active button
			$scope.section = $scope.sections[$scope.page];
			$scope.localEmojis =  $localStorage.emojis || [];
			$scope.found = $scope.localEmojis;

			$http({
				method : "GET",
				url : "https://api.github.com/emojis"
			}).then(function mySuccess(response) {
				$scope.emojis = response.data;
				updateEmojis( response.data);
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
		function split_found(){
			var img_in_page=10;
			$scope.pagecount = Math.ceil($scope.found.length/img_in_page);
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
				if(n==img_in_page){
					$scope.pages.push(onepage);
					n=0;
					onepage=[];
					pagen++;
				}
			}
			if (n>0){
				$scope.pages.push(onepage);
			}
			$scope.curpage = $scope.pages[0];
			$scope.setPage(0);
		}
		//=======================================================
		//              events/listeners
		//------------------------------------------------
		//              img event listeners
		$scope.img_move = function(img,event) {
			$scope.img_div_style = 'left:'+(event.clientX+3)+'px;top:'+(event.clientY+3)+'px';
		}
		$scope.img_over = function(img) {
			$scope.img_div_class='img-visible';
			$scope.fullimg=img.emoji.url;
		}
		$scope.img_out = function() {
			$scope.img_div_class='img-hidden';
		}
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
		$scope.do_search = function(){
			var filterd =  $filter('category')($scope.localEmojis, $scope);
			$scope.found = $filter('searchById')(filterd, $scope.search.id);
			split_found();
		}
		$scope.setPage = function(page){
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
			$scope.reDrawEmojiList();
		}
		
		$scope.delEmoji = function(emoji){
			if (emoji.cat=="all" || (emoji.cat=="fav" && $scope.page=="all")){
				emoji.cat="del";
				emoji.css.data="img-no-transparent";
			}else if (emoji.cat=="fav" && $scope.page=="fav"){
				emoji.cat="all";
				emoji.css.data="img-transparent";
			}
			$scope.reDrawEmojiList();
		}
		$scope.reDrawEmojiList = function(){
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