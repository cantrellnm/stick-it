var app = angular.module('StickIt', ['ngAria', 'angularMoment']);
var socket = io.connect();

app.controller('PostController', ['$scope', function($scope) {
  
  this.showNew = false;
  this.toggleNew = function() {
    this.showNew = !this.showNew;
  };
  
  this.alertMsg = '';
  this.showAlert = false;
  this.alert = function(msg) {
    this.alertMsg = msg;
    this.showAlert = true;
  };
  this.closeAlert = function() {
    this.alertMsg = '';
    this.showAlert = false;
  };
  
  $scope.reverse = false;
  this.toggleReverse = function() {
    $scope.reverse = !$scope.reverse;
    $scope.posts.reverse();
  };
  
  $scope.connected = false;
  $scope.posts = [];
  socket.on('connect', function(){
    console.log('connected');
    $scope.connected = true;
    $scope.$apply();
  });
  socket.on('new post', function(post){
    if (getPostsById(post._id).length === 0) { //if post isn't already in posts
      if ($scope.reverse === false) {
        $scope.posts.unshift(post);
      } else {
        $scope.posts.push(post);
      }
      $scope.$apply();
    }
  });
  socket.on('remove post', function(postID){
    if (getPostsById(postID).length > 0) { //if post exists
      $scope.posts.splice($scope.posts.indexOf(getPostsById(postID)[0]), 1);
      $scope.$apply();
    }
  });
  socket.on('disconnect', function(){
    console.log('disconnected');
    $scope.connected = false;
    $scope.$apply();
  });
  
  this.noteText = '';
  this.color = 'yellow';
  this.selectColor = function(color) {
    this.color = color;
  };
  this.addNote = function() {
    if ($scope.connected === true) {
      socket.emit('new', {time: new Date(), note: this.noteText, color: this.color});
      this.noteText = '';
      this.toggleNew();
    } else {
      this.alert("Can't connect to the server, please wait and try again in a moment.");
    }
  }
  
  this.remove = function(post) {
    if ($scope.connected === true) {
      socket.emit('remove', post);
    } else {
      this.alert("Can't connect to the server, please wait and try again in a moment."); 
    }
  };
  
  function getPostsById(id) {
    //returns an array of matching posts (should be 0 or 1)
    return $scope.posts.filter(function(post){return post._id === id;});
  }
}]);