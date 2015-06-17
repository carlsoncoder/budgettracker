var budgetEntryControllers = angular.module('budgetentry.controllers', []);

budgetEntryControllers.controller('BudgetController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    'budgetcategories',
    'budgetexpenses',
    'auth',
    function($scope, $rootScope, $state, $stateParams, budgetcategories, budgetexpenses, auth) {
        $scope.$state = $state;
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentCategory = {};
        $scope.currentExpense = {};
        $scope.selectedBudgetCategory = {};
        $scope.isRecordEdit = false;
        $scope.errorMessage = '';
        $scope.selectedCategoryId = '';
        $scope.selectedCategoryName = '';
        $scope.userMessage = {};
        $scope.budgetCategories = budgetcategories.categories;
        $scope.currentMonthExpenses = [];
        $scope.showDateChanger = false;
        $scope.dateToChange = new Date();
        $scope.filterOptions = ['ALL', 'WITHIN 10 %', 'OVER BUDGET'];
        $scope.currentExpense.affectedDate = new Date();

        var totalBudgetedAllCategories = 0;
        for (var j = 0; j < $scope.budgetCategories.length; j++) {
            totalBudgetedAllCategories += $scope.budgetCategories[j].budgetedAmount;
        }

        $scope.totalBudgetedAllCategories = totalBudgetedAllCategories;

        if ($stateParams.categoryId) {
            $scope.isRecordEdit = true;
            for (var i = 0; i < $scope.budgetCategories.length; i++) {
                var category = $scope.budgetCategories[i];
                if (category._id === $stateParams.categoryId) {
                    $scope.currentCategory = category;
                    $scope.currentCategory.budgetedAmount = ($scope.currentCategory.budgetedAmount / 100).toFixed(2);
                    break;
                }
            }
        }

        if ($stateParams.expenseId) {
            $scope.isRecordEdit = true;
            budgetexpenses.loadSpecificExpense($stateParams.expenseId, function(status, err, expenseDetail) {
                if (!status) {
                    $scope.errorMessage = 'Error loading expense detail: ' + err;
                }
                else {
                    $scope.currentExpense = expenseDetail.expense;
                    $scope.selectedBudgetCategory = expenseDetail.category;
                }
            });
        }

        if ($stateParams.detailsCategoryId) {
            $scope.selectedCategoryId = $stateParams.detailsCategoryId;

            budgetcategories.getNameForId($scope.selectedCategoryId, function(err, name) {
                if (err) {
                    $scope.userMessage = { type: 'error', title: 'Budget Details', message: 'Error loading category details: ' + err, nextState: 'NONE'};
                }
                else {
                    $scope.selectedCategoryName = name;
                }
            });
        }

        if ($stateParams.dateToChange) {
            $scope.dateToChange = new Date($stateParams.dateToChange);
        }

        $scope.loadBudgetExpenses = function(dateToLoad) {
            budgetexpenses.loadByMonth(dateToLoad, $scope.budgetCategories, function(status, err, expenses) {
                if (!status) {
                    $scope.userMessage = { type: 'error', title: 'Budget Expenses for Month', message: 'Error loading expenses: ' + err, nextState: 'NONE'};
                }
                else {
                    $scope.currentMonthExpenses = expenses;

                    if (IsNullOrUndefined(dateToLoad)) {
                        dateToLoad = new Date();
                    }

                    determineDateDisplayString(dateToLoad);
                }
            });
        };

        $scope.loadBudgetComparisonDetails = function() {
            budgetexpenses.loadDetailsByMonthAndCategory($scope.dateToChange, $scope.selectedCategoryId, function(status, err, details) {
                if (!status) {
                    $scope.userMessage = { type: 'error', title: 'Budget Expenses for Month and Category', message: 'Error loading details: ' + err, nextState: 'NONE'};
                }
                else {
                    $scope.currentCategoryDetails = details;
                    determineDateDisplayString($scope.dateToChange);
                }
            });
        };

        $scope.enableShowDateChanger = function() {
            $scope.showDateChanger = true;
        };

        $scope.changeDate = function() {
            if (IsNullOrUndefined($scope.dateToChange) || $scope.dateToChange === '') {
                $scope.errorMessage = 'You must enter a valid date';
                return;
            }

            $scope.loadBudgetExpenses($scope.dateToChange);
            $scope.showDateChanger = false;
            $scope.errorMessage = '';
        };

        $scope.saveBudgetExpense = function() {
            if (IsNullOrUndefined($scope.currentExpense.affectedDate) || $scope.currentExpense.affectedDate === '') {
                $scope.errorMessage = 'A date is required for the expense';
                return;
            }

            if (IsNullOrUndefined($scope.currentExpense.amount) || $scope.currentExpense.amount === '') {
                $scope.errorMessage = 'An amount is required for the expense';
                return;
            }

            if (!IsNumber($scope.currentExpense.amount) || $scope.currentExpense.amount < 0) {
                $scope.errorMessage = 'A valid number greater than zero must be specified for the expense amount';
                return;
            }

            if (IsNullOrUndefined($scope.selectedBudgetCategory) || IsNullOrUndefined($scope.selectedBudgetCategory._id)) {
                $scope.errorMessage = 'A category must be specified for the expense';
                return;
            }

            if (!IsNullOrUndefined($scope.currentExpense.comment) && $scope.currentExpense.comment !== '') {
                if ($scope.currentExpense.comment.length > 256) {
                    $scope.errorMessage = 'The maximum comment length is 256.  Please enter a shorter comment';
                    return;
                }
            }

            // set the category ID based on the drop down selected
            $scope.currentExpense.categoryId = $scope.selectedBudgetCategory._id;

            budgetexpenses.save($scope.currentExpense, function(status, msg) {
                if (status === true) {
                    $scope.userMessage = { type: 'success', title: 'Budget Expense', message: 'Expense saved!', nextState: 'home'};
                }
                else {
                    $scope.errorMessage = 'Error saving expense: ' + msg;
                }
            });
        };

        $scope.saveBudgetCategory = function() {
            if (IsNullOrUndefined($scope.currentCategory.name) || $scope.currentCategory.name === '') {
                $scope.errorMessage = 'A name is required for the budget category';
                return;
            }

            if (IsNullOrUndefined($scope.currentCategory.description) || $scope.currentCategory.description === '') {
                $scope.errorMessage = 'A description is required for the budget category';
                return;
            }

            if (IsNullOrUndefined($scope.currentCategory.budgetedAmount) || $scope.currentCategory.budgetedAmount === '') {
                $scope.errorMessage = 'A budgeted amount is required for the budget category';
                return;
            }

            if (!IsNumber($scope.currentCategory.budgetedAmount) || $scope.currentCategory.budgetedAmount < 0) {
                $scope.errorMessage = 'A valid number greater than zero must be specified for the budgeted amount';
                return;
            }

            budgetcategories.save($scope.currentCategory, function(status, msg) {
                if (status === true) {
                    $scope.userMessage = { type: 'success', title: 'Budget Category', message: 'Budget category saved!', nextState: 'managecategories'};
                }
                else {
                    $scope.errorMessage = 'Error saving category: ' + msg;
                }
            });
        };

        $scope.deleteBudgetCategory = function(category) {
            var prompt = confirm("Are you sure you want delete the '" + category.name + ' category?');
            if (prompt === true) {
                budgetcategories.delete(category._id, function(status, msg) {
                    if (status === true) {
                        $scope.userMessage = { type: 'success', title: 'Budget Category', message: 'Category successfully deleted!', nextState: 'NONE'};
                        updateDeletedCategory(category);
                    }
                    else {
                        $scope.errorMessage = 'Error deleting category: ' + msg;
                    }
                });
            }
        };

        $scope.deleteBudgetExpense = function(expenseId) {
            var prompt = confirm("Are you sure you want delete this expense?");
            if (prompt === true) {
                budgetexpenses.delete(expenseId, function(status, msg) {
                    if (status === true) {
                        $scope.userMessage = { type: 'success', title: 'Budget Expense', message: 'Expense successfully deleted!', nextState: 'NONE'};
                        updateDeletedExpense(expenseId);
                    }
                    else {
                        $scope.errorMessage = 'Error deleting expense: ' + msg;
                    }
                });
            }
        };

        function updateDeletedCategory(deleted) {
            var newCategoryList = [];

            for (var i = 0; i < $scope.budgetCategories.length; i++) {
                if ($scope.budgetCategories[i]._id !== deleted._id) {
                    newCategoryList.push($scope.budgetCategories[i]);
                }
            }

            $scope.budgetCategories = newCategoryList;
        }

        function updateDeletedExpense(deletedId) {
            var newExpenseDetailsList = [];
            for (var i = 0; i < $scope.currentCategoryDetails.length; i++) {
                if ($scope.currentCategoryDetails[i]._id !== deletedId) {
                    newExpenseDetailsList.push($scope.currentCategoryDetails[i]);
                }
            }

            $scope.currentCategoryDetails = newExpenseDetailsList;
        }

        function determineDateDisplayString(dateToDisplay) {
            var year = dateToDisplay.getYear() + 1900;
            var month = dateToDisplay.getMonth() + 1;
            var dateString = year.toString() + '-' + (month < 10 ? '0' + month.toString() : month.toString());
            $scope.currentDisplayMonth = formatMonthString(dateString);
        }
    }]);

budgetEntryControllers.controller('NavigationController', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth) {
        $scope.user = {};
        $scope.errorMessage = '';

        $scope.$state = $state;
        $scope.userMessage = {};

        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;

        $scope.user = {};

        $scope.logIn = function() {
            if (IsNullOrUndefined($scope.user.username) || $scope.user.username === '') {
                $scope.errorMessage = 'Please enter your user name';
                return;
            }

            if (IsNullOrUndefined($scope.user.password) || $scope.user.password === '') {
                $scope.errorMessage = 'Please enter your password';
                return;
            }

            auth.logIn($scope.user, function(status, message) {
                if (!status) {
                    $scope.errorMessage = message;
                    $scope.user.password = '';
                }
                else {
                    $state.go('home');
                }
            });
        };

        $scope.logOut = function() {
            auth.logOut();
            $state.go('login');
        };

        $scope.changePassword = function() {
            if (IsNullOrUndefined($scope.oldPassword) || $scope.oldPassword === '') {
                $scope.errorMessage = 'You must enter the old password';
                return;
            }

            if (IsNullOrUndefined($scope.newPassword) || $scope.newPassword === '') {
                $scope.errorMessage = 'You must enter a new password';
                return;
            }

            if (IsNullOrUndefined($scope.newPasswordConfirm) || $scope.newPasswordConfirm === '') {
                $scope.errorMessage = 'You must confirm your new password';
                return;
            }

            if ($scope.newPassword !== $scope.newPasswordConfirm) {
                $scope.errorMessage = 'Your new passwords do not match - please re-enter';
                return;
            }

            auth.changePassword($scope.oldPassword, $scope.newPassword, function(status, message) {
                if (!status) {
                    $scope.errorMessage = message;
                }
                else {
                    $scope.userMessage = { type: 'success', title: 'Login Information', message: 'Password successfully changed!', nextState: 'home'};
                }
            });
        };
    }
]);