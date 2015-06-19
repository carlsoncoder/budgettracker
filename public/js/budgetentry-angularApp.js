var app = angular.module('budgetEntryApp',
    [
        'ui.router',
        'tableSort',
        'n3-line-chart',
        'budgetentry.controllers',
        'budgetentry.filters',
        'budgetentry.directives',
        'budgetentry.factories',
        'budgetentry.injectors'
    ]
);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state(
                'home',
                {
                    url: '/',
                    templateUrl: 'templates/budgetcomparisons.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'addbudgetexpense',
                {
                    url: '/addbudgetexpense',
                    templateUrl: 'templates/addmodifybudgetentry.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'modifybudgetexpense',
                {
                    url: '/modifybudgetexpense/{expenseId}',
                    templateUrl: 'templates/addmodifybudgetentry.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'managecategories',
                {
                    url: '/managecategories',
                    templateUrl: 'templates/managecategories.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'budgetchart',
                {
                    url: '/budgetchart',
                    templateUrl: 'templates/budgetchart.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'budgetcomparisons',
                {
                    url: '/budgetcomparisons',
                    templateUrl: 'templates/budgetcomparisons.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'budgetcomparisondetails',
                {
                    url: '/budgetcomparisondetails/{detailsCategoryId}/{dateToChange}',
                    templateUrl: 'templates/budgetcomparisondetails.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'addbudgetcategory',
                {
                    url: '/addbudgetcategory',
                    templateUrl: 'templates/addmodifybudgetcategory.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'modifybudgetcategory',
                {
                    url: '/modifybudgetcategory/{categoryId}',
                    templateUrl: 'templates/addmodifybudgetcategory.html',
                    controller: 'BudgetController',
                    resolve: {
                        budgetCategoryPromise: ['budgetcategories', function(budgetcategories) {
                            return budgetcategories.getAll();
                        }]
                    },
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'login',
                {
                    url: '/login',
                    templateUrl: 'templates/login.html',
                    controller: 'NavigationController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (auth.isLoggedIn())
                        {
                            $state.go('home');
                        }
                    }]
                })
            .state(
                'changepassword',
                {
                    url: '/changepassword',
                    templateUrl: 'templates/changepassword.html',
                    controller: 'NavigationController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                }
            );

        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('tokenInjector');
        $httpProvider.interceptors.push('loadingStatusInjector');
}]);