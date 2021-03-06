"use strict";

var Lesson = angular.module('Lesson', ["ui.router", "restangular", "Devise", 'ngFileUpload', "xeditable", 'angularUtils.directives.dirPagination', 'rzModule', 'flash']);

angular.module('Lesson').factory('_', ['$window', function($window) {
  return $window._;
}]);

angular.module('Lesson').factory('SimpleMDE', ['$window', function($window) {
  return $window.SimpleMDE;
}]);

angular.module('Lesson').factory('JsDiff', ['$window', function($window) {
  return $window.JsDiff;
}]);

angular.module('Lesson').config([
  "$httpProvider",
  function($httpProvider) {
    var token = $('meta[name=csrf-token]').attr('content');
    $httpProvider.defaults.headers.common['X-CSRF-Token'] = token;
  }
]);

// config for x-editable
angular.module('Lesson').run(['editableOptions', 'editableThemes', function(editableOptions, editableThemes) {
  editableOptions.theme = 'default'; // bootstrap3 theme. Can be also 'bs2', 'default'
  editableThemes['default'].submitTpl = '<button type="submit" class="btn btn-success btn-sm"><i class="fa fa-check" aria-hidden="true"></i></button>';
  editableThemes['default'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-danger btn-sm"><i class="fa fa-times" aria-hidden="true"></i></button>';

}]);

// config for restangular
angular.module('Lesson').config([
  'RestangularProvider',
  function(RestangularProvider) {

    RestangularProvider.setBaseUrl('/api/v1');
    RestangularProvider.setRequestSuffix('.json');
    RestangularProvider.setDefaultHttpFields({"content-type": "application/json"});
  }
]);

angular.module('Lesson').
    config(['AuthProvider', function(AuthProvider) {
        AuthProvider.loginPath('teachers/sign_in.json');
        AuthProvider.loginMethod('POST');
        AuthProvider.resourceName('teacher');
    }]);

// config for pagination
angular.module('Lesson')
  .config(['paginationTemplateProvider', function(paginationTemplateProvider) {
    paginationTemplateProvider
    .setPath('lesson_templates/dirPagination.tpl.html');
}]);

//routes
angular.module('Lesson').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise('/redirect');

	$stateProvider
	 .state('main',{
    url: '',
    template: "<div ui-view></div>",
    abstract: true,
		resolve: {
			currentUser: ['Auth', function(Auth){
            return Auth.currentUser()
            .then(function(user){
              return user;
            });
          }],
      currentTeacher: ['currentUser', 'TeacherService', function(currentUser, TeacherService) {
        return TeacherService.getTeacher(currentUser.id);
      }]
    }
	})

   .state('main.redirect', {
      url: "/redirect",
      controller: ['currentUser', '$state', function(currentUser, $state){
            $state.go('main.teachers.overview', {id: currentUser.id});

        }]
    })

		.state('main.lessons', {
      url: '/lessons',
      abstract: true
		})

    .state('main.search', {
      url: '/search/?type=:searchType&params=:searchTerm',
      params: {
        searchType: null,
        searchTerm: null
      },
      templateUrl: 'lesson_templates/lessons/search.html',
      controller: 'SearchCtrl'
    })

		.state('main.lessons.show', {
      url: '/:id',
      resolve: {
        lesson: ['LessonService', '$stateParams', function(LessonService, $stateParams) {
              return LessonService.getLesson($stateParams.id);
            }],
        owner: ['TeacherService', 'lesson', function(TeacherService, lesson) {
              return TeacherService.getTeacher(lesson.teacher_id);
            }],

        lessonBelongsToCurrentUser: ["currentUser", "lesson", function(currentUser, lesson){
          return (currentUser.id === lesson.teacher_id);
        }]

      },
      views: {
        '@': {
          templateUrl: "lesson_templates/show.html",
          controller: "LessonShowCtrl",
        },

        'newPullRequest@main.lessons.show': {
          templateUrl: "lesson_templates/pull_requests/new.html",
           controller: "PullRequestNewCtrl",
           resolve: {
            teacher: ["TeacherService", "currentUser", function(TeacherService, currentUser){
              return TeacherService.getTeacher(currentUser.id);
            }]
           }
        },

        'mainContainer@main.lessons.show': {
          templateUrl: "lesson_templates/lessons/show.html",
          controller: "LessonShowCtrl"
        }
      }
    })

		.state('main.lessons.show.pullRequests', {
      url: '/pullrequests',
      views: {
        "mainContainer@main.lessons.show": {
          templateUrl:  "lesson_templates/pull_requests/index.html",
          controller: "PullRequestIndexCtrl",
          resolve: {
            pullRequests: ["pullRequestService",
                            "$stateParams",
                            function(pullRequestService, $stateParams) {
                return pullRequestService.all($stateParams.id);
              }]
          }
        },
      }
    })

    .state('main.lessons.show.contributors', {
      url: '/contributors',
      views: {
        "mainContainer@main.lessons.show": {
          templateUrl:  "lesson_templates/lessons/contributors.html",
          controller: "LessonShowCtrl"
        }
      }
    })

    .state('main.lessons.show.settings', {
      url: '/settings',
      views: {
        "mainContainer@main.lessons.show": {
          templateUrl:  "lesson_templates/lessons/settings.html",
          controller: "LessonShowCtrl"
        }
      }
    })

		.state('main.teachers', {
			url: '/teachers/:id',
      abstract: true,
			templateUrl: "lesson_templates/teacher/teacher_show.html",
			controller: "TeacherShowCtrl",
			resolve: {
	      teacher: ["$stateParams", "TeacherService", function($stateParams, TeacherService){
	        	return TeacherService.getTeacher($stateParams.id);
	      }],
         populate: ["$stateParams", "FollowingService", function($stateParams, FollowingService){
            FollowingService.populate($stateParams.id);
        }],
        getCalendarInfo: ["$stateParams", "ContributionsService", function($stateParams, ContributionsService){
          return ContributionsService.populate($stateParams.id);
        }]
			}
		})
    .state('main.teachers.overview',{
      url: '/overview',
      templateUrl: 'lesson_templates/teacher/overview.html'
    })
    .state('main.teachers.lessonPlans',{
      url: '/lessonPlans',
      templateUrl: 'lesson_templates/teacher/lesson_plans.html',
      controller: 'LessonPlanCtrl'
    })
    .state('main.teachers.starred',{
      url: '/starred',
      templateUrl: 'lesson_templates/teacher/starred.html',
      resolve: {
        starred_lessons: ["$stateParams", "Restangular", function($stateParams, Restangular){
          return Restangular.all('lesson_plan_stars').getList({teacher_id: $stateParams.id});
        }]
      },
      controller: 'StarredLessonsCtrl'
    })
    .state('main.teachers.contributions',{
      url: '/contributions',
      templateUrl: 'lesson_templates/teacher/contributions.html',
      resolve: {
        lessons_contributed_to: ["$stateParams", "Restangular", function($stateParams, Restangular){
          return Restangular.all('lesson_plan_contributors').getList({teacher_id: $stateParams.id});
        }]
      },
      controller: 'ContributionsCtrl'
    })
    .state('main.teachers.followers',{
      url: '/followers',
      templateUrl: 'lesson_templates/teacher/followers.html',
      controller: "TeacherFollowersCtrl"
    })
    .state('main.teachers.following',{
      url: '/following',
      templateUrl: 'lesson_templates/teacher/following.html',
      controller: "TeacherFollowingCtrl"
    })






    ;

}]);

angular.module('Lesson').run(['$rootScope', function($rootScope){
  $rootScope.$on("$stateChangeError", console.error.bind(console));
}]);
