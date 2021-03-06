var budgetEntryDirectives = angular.module('budgetentry.directives', []);

budgetEntryDirectives.directive('scriptLoader', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var pageName = attrs.pagename;
            switch (pageName)
            {
                case 'home':
                {
                    initializeOnControllerLoad(budgetComparisonSectionLinkId);
                    break;
                }

                case 'enterbudgetexpense':
                {
                    initializeOnControllerLoad(enterExpenseSectionLinkId);
                    scope.removeAllCategory();
                    break;
                }

                case 'managecategories':
                {
                    initializeOnControllerLoad(manageCategoriesSectionLinkId);
                    break;
                }

                case 'budgetchart':
                {
                    initializeOnControllerLoad(budgetChartSectionLinkId);
                    scope.injectAllCategory();
                    scope.loadChartData('ALL');
                    break;
                }

                case 'budgetcomparisons':
                {
                    initializeOnControllerLoad(budgetComparisonSectionLinkId);
                    scope.loadBudgetExpenses();
                    break;
                }

                case 'budgetcomparisondetails':
                {
                    initializeOnControllerLoad(budgetComparisonSectionLinkId);
                    scope.loadBudgetComparisonDetails();
                    break;
                }
            }
        }
    };
});

budgetEntryDirectives.directive('loadingSpinner', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch('activeCalls', function(newValue, oldValue) {
                if (newValue === 0) {
                    $(element).hide();
                }
                else {
                    $(element).show();
                }
            });
        }
    };
});

budgetEntryDirectives.directive('toastrWatcher', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            scope.$watch('userMessage', function(newValue, oldValue) {
                if (!isNullOrUndefined(newValue) && !isNullOrUndefined(newValue.message)) {
                    if (newValue.type === 'success') {
                        toastr.success(newValue.message, newValue.title);

                        if (newValue.nextState !== 'NONE' && !isNullOrUndefined(scope) && !isNullOrUndefined(scope.$state)) {
                            scope.$state.go(newValue.nextState);
                        }
                    }
                    else {
                        toastr.error(newValue.message, newValue.title);
                    }
                }
            });
        }
    };
});