var budgetEntryFactories = angular.module('budgetentry.factories', []);
var oneHourInMs = 3600000;
var cachedBudgetCategories = new CacheContainer(oneHourInMs);

budgetEntryFactories.factory('budgetexpenses', ['$http', '$state', 'budgetcategories', function($http, $state, budgetcategories) {
    var budgetExpenseFactory = {};

    budgetExpenseFactory.loadByMonth = function(dateToLoad, budgetCategories, callback) {
        if (isNullOrUndefined(dateToLoad)) {
            dateToLoad = new Date();
        }

        $http.get('/budget/expensesformonth', { params: {loadDate: dateToLoad } })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString(), null);
                }
                else {
                    callback(true, '', data);
                }
            })
            .error(function(data, status) {
                callback(false, data.toString(), null);
            });
    };

    budgetExpenseFactory.loadDetailsByMonthAndCategory = function(dateToLoad, categoryId, callback) {
        if (isNullOrUndefined(dateToLoad)) {
            dateToLoad = new Date();
        }

        $http.get('/budget/expensedetailsformonthandcategory', { params: {loadDate: dateToLoad, categoryId: categoryId } })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString(), null);
                }
                else {
                    callback(true, '', data);
                }
            })
            .error(function(data, status) {
                callback(false, data.toString(), null);
            });
    };

    budgetExpenseFactory.loadSpecificExpense = function(expenseId, callback) {
        $http.get('/budget/expensedetail', { params: {expenseId: expenseId } })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString(), null);
                }
                else {
                    // need to massage the data a little before presenting to the user
                    data.amount = (data.amount / 100).toFixed(2);
                    data.affectedDate = new Date(data.affectedDate);

                    var expenseDetails = {};
                    expenseDetails.expense = {
                        _id: data._id,
                        categoryId: data.categoryId,
                        affectedDate: data.affectedDate,
                        amount: data.amount,
                        comment: data.comment
                    };

                    for (var i = 0; i < budgetcategories.categories.length; i++) {
                        var category = budgetcategories.categories[i];
                        if (category._id.toString() === data.categoryId.toString()) {
                            expenseDetails.category = category;
                            break;
                        }
                    }

                    callback(true, '', expenseDetails);
                }
            })
            .error(function(data, status) {
                callback(false, data.toString(), null);
            });
    };

    budgetExpenseFactory.save = function(expense, callback) {
        $http.post('/budget/saveexpense', { expense: expense })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString());
                }
                else {
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    budgetExpenseFactory.delete = function(expenseId, callback) {
      $http.post('/budget/deleteexpense', { expenseId: expenseId })
          .success(function(data, status) {
              if (status === 500) {
                  callback(false, data.toString());
              }
              else {
                  callback(true, '');
              }
          })
          .error(function(data, status) {
              callback(false, data.toString());
          });
    };

    return budgetExpenseFactory;
}]);

budgetEntryFactories.factory('budgetcategories', ['$http', '$state', function($http, $state) {
    var budgetCategoryFactory = {};
    budgetCategoryFactory.categories = [];

    budgetCategoryFactory.getAll = function() {
        if (cachedBudgetCategories.isValid()) {
            budgetCategoryFactory.categories = cachedBudgetCategories.cachedData;
        }
        else {
            return $http.get('/budget/categories').success(function(data) {
                angular.copy(data, budgetCategoryFactory.categories);
                cachedBudgetCategories.assignData(budgetCategoryFactory.categories);
            });
        }
    };

    budgetCategoryFactory.getNameForId = function(categoryId, callback) {
        for (var j = 0; j < this.categories.length; j++) {
            var category = this.categories[j];
            if (category._id.toString() === categoryId.toString()) {
                return callback(null, category.name);
            }
        }
    };

    budgetCategoryFactory.delete = function(categoryId, callback) {
        $http.post('/budget/deletecategory', { categoryId: categoryId })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString());
                }
                else {
                    cachedBudgetCategories.clearCache();
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    budgetCategoryFactory.save = function(categoryToSave, callback) {
        $http.post('/budget/savecategory', { category: categoryToSave })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString());
                }
                else {
                    cachedBudgetCategories.clearCache();
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    return budgetCategoryFactory;
}]);

budgetEntryFactories.factory('budgetcharts', ['$http', '$state', function($http, $state) {
    var budgetChartFactory = {};

    budgetChartFactory.loadDataForCategory = function(categoryId, callback) {

        $http.get('/budget/chartdetailsbycategory', { params: {categoryId: categoryId } })
            .success(function(data, status) {
                if (status === 500) {
                    callback(false, data.toString(), null);
                }
                else {
                    data.forEach(function(row) {
                        // get the data back into native types instead of strings
                        row.x = new Date(row.x);
                        row.budgeted = parseInt(row.budgeted);
                        row.actual = parseInt(row.actual);
                    });

                    callback(true, '', data);
                }
            })
            .error(function(data, status) {
                callback(false, data.toString(), null);
            });
    };

    return budgetChartFactory;
}]);

budgetEntryFactories.factory('auth', ['$http', '$window', function($http, $window) {
    var authFactory = {};

    authFactory.saveToken = function(token) {
        $window.localStorage['budget-entry-website-token'] = token;
    };

    authFactory.getToken = function() {
        return $window.localStorage['budget-entry-website-token'];
    };

    authFactory.isLoggedIn = function() {
        var token = authFactory.getToken();
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        }
        else {
            return false;
        }
    };

    authFactory.currentUser = function() {
        if (authFactory.isLoggedIn()) {
            var token = authFactory.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    authFactory.logIn = function(user, callback) {
        $http.post('/login', user)
            .success(function(data, status) {
                if (status === 401) {
                    callback(false, data.toString());
                }
                else {
                    authFactory.saveToken(data.token);
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    authFactory.logOut = function() {
        $window.localStorage.removeItem('budget-entry-website-token');
    };

    authFactory.changePassword = function(oldPassword, newPassword, callback) {
        $http.post('/changepassword', { oldPassword: oldPassword, newPassword: newPassword})
            .success(function(data, status) {
                if (status === 401) {
                    callback(false, 'Invalid Login Details');
                }
                else {
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    return authFactory;
}]);