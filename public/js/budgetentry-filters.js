var budgetEntryFilters = angular.module('budgetentry.filters', []);

budgetEntryFilters.filter('to_monetary_value', function() {
    return function(input) {
        return '$' + ((input / 100).toFixed(2)).toString();
    };
});

budgetEntryFilters.filter('filter_budget_category', function() {
    return function(input, selectedFilterOption) {
        if (selectedFilterOption === 'ALL') {
            return true;
        }

        if (selectedFilterOption === 'WITHIN 10 %' && input.isWithinTenPercent) {
            return true;
        }

        if (selectedFilterOption === 'OVER BUDGET' && input.isOverBudget) {
            return true;
        }

        return false;
    };
});