var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var BudgetEntries = mongoose.model('BudgetEntry');
var budgetCategoryRepository = require('./budgetcategoryrepository');

var startingDate = new Date('Sun May 01 2016 00:00:00 GMT-0600 (CST)');
var budgetEntryRepository = {};

budgetEntryRepository.loadByMonth = function(userId, loadDate, callback) {
    budgetCategoryRepository.loadAll(userId, function(err, categories) {
        var dateRange = getDateRangeForMonth(loadDate);
        var startQueryDate = dateRange.startDate;
        var endQueryDate = dateRange.endDate;

        var query = BudgetEntries.find({ 'userId' : new ObjectId(userId), 'affectedDate': {$gte: startQueryDate, $lt: endQueryDate} }, 'categoryId affectedDate amount').sort('affectedDate');
        query.exec(function(err, expenses) {
            if (err) {
                return callback(err);
            }

            var myDictionary = {};
            for (var i = 0; i < expenses.length; i++) {
                var categoryId = expenses[i].categoryId;
                var amount = expenses[i].amount;

                if (myDictionary[categoryId] === null || myDictionary[categoryId] === undefined) {
                    myDictionary[categoryId] = amount;
                }
                else {
                    myDictionary[categoryId] = myDictionary[categoryId] + amount;
                }
            }

            var monthlyExpenses = [];
            var totalBudgeted = 0;
            var totalActual = 0;
            for (var j = 0; j < categories.length; j++) {
                var budgetCategory = categories[j];
                var category_Id = budgetCategory._id;
                var categoryName = budgetCategory.name;
                var categoryDescription = budgetCategory.description;
                var budgetedAmount = budgetCategory.budgetedAmount;

                totalBudgeted += budgetedAmount;

                var actualAmount = 0;
                var percentOfBudget = (0.00).toFixed(2);
                var isOverBudget = false;
                var isWithinTenPercent = false;

                for (var key in myDictionary) {
                    if (key.toString() === category_Id.toString()) {
                        actualAmount = myDictionary[key];
                        totalActual += actualAmount;

                        percentOfBudget = (((myDictionary[key] / budgetedAmount).toFixed(2)) * 100).toFixed(2);
                        isOverBudget = actualAmount > budgetedAmount;
                        isWithinTenPercent = percentOfBudget >= 90;

                        break;
                    }
                }

                monthlyExpenses.push({
                    categoryId: category_Id,
                    categoryName: categoryName,
                    categoryDescription: categoryDescription,
                    budgetedAmount: budgetedAmount,
                    actualAmount: actualAmount,
                    percentOfBudget: percentOfBudget,
                    isOverBudget: isOverBudget,
                    isWithinTenPercent: !isOverBudget && isWithinTenPercent
                });
            }

            var returnStructure = {};
            returnStructure.allCategories = monthlyExpenses;
            returnStructure.totalBudgeted = totalBudgeted;
            returnStructure.totalActual = totalActual;
            returnStructure.totalPercentOfBudget = ((totalActual / totalBudgeted) * 100).toFixed(2);

            return callback(null, returnStructure);
        });
    });
};

budgetEntryRepository.loadDetailsByMonthAndCategory = function(userId, categoryId, loadDate, callback) {
    var dateRange = getDateRangeForMonth(loadDate);
    var startQueryDate = dateRange.startDate;
    var endQueryDate = dateRange.endDate;

    var query = BudgetEntries.find(
        {
            'userId' : new ObjectId(userId),
            'categoryId' : new ObjectId(categoryId),
            'affectedDate': {$gte: startQueryDate, $lt: endQueryDate}
        },
        'affectedDate amount comment')
        .sort('affectedDate');

    query.exec(function(err, expenses) {
        if (err) {
            return callback(err);
        }

        return callback(null, expenses);
    });
};

budgetEntryRepository.loadSpecificExpense = function(userId, expenseId, callback) {
    var query = BudgetEntries.findOne(
        {
            'userId' : new ObjectId(userId),
            '_id' : new ObjectId(expenseId)
        },
        'categoryId affectedDate amount comment');

    query.exec(function(err, expense) {
        if (err) {
            return callback(err);
        }

        return callback(null, expense);
    });
};

budgetEntryRepository.loadChartData = function(userId, categoryId, callback) {
    var today = new Date();

    var initialMonthProcessed = false;
    var currentLoopDateTime = new Date(startingDate);

    var datesToLoad = [];

    while (true) {
        if (initialMonthProcessed) {
            currentLoopDateTime.setMonth(currentLoopDateTime.getMonth() + 1);
        }
        else {
            initialMonthProcessed = true;
        }

        var startDate = new Date(currentLoopDateTime);
        var endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setSeconds(endDate.getSeconds() - 1);

        datesToLoad.push({
            startDate: startDate,
            endDate: endDate,
            actualAmount: 0
        });

        if (currentLoopDateTime > today) {
            break;
        }
    }

    budgetCategoryRepository.loadAll(userId, function (err, categories) {
        if (err) {
            return callback(err);
        }

        var budgetedAmount = 0;

        var expensesQuery = null;
        if (categoryId === 'ALL') {
            expensesQuery = BudgetEntries.find({'userId': new ObjectId(userId)}, 'affectedDate amount').sort('affectedDate');
            categories.forEach(function (category) {
                budgetedAmount += category.budgetedAmount;
            });
        }
        else {
            expensesQuery = BudgetEntries.find({
                'userId': new ObjectId(userId),
                'categoryId': new ObjectId(categoryId)
            }, 'affectedDate amount').sort('affectedDate');
            categories.forEach(function (category) {
                if (category._id.toString() === categoryId.toString()) {
                    budgetedAmount = category.budgetedAmount;
                }
            });
        }

        budgetedAmount = budgetedAmount / 100;

        expensesQuery.exec(function(err, expenses) {
            for (var j = 0; j < expenses.length; j++) {
                var currentExpense = expenses[j];
                for (var k = 0; k < datesToLoad.length; k++) {
                    var currentDateObject = datesToLoad[k];
                    if (currentExpense.affectedDate >= currentDateObject.startDate && currentExpense.affectedDate <= currentDateObject.endDate) {
                        currentDateObject.actualAmount += currentExpense.amount;
                        break;
                    }
                }
            }

            var totals = [];

            datesToLoad.forEach(function(record) {
                totals.push({
                    x: record.startDate,
                    budgeted: budgetedAmount,
                    actual: parseInt(record.actualAmount / 100)
                });
            });

            return callback(null, totals);
        });
    });
};

budgetEntryRepository.save = function(userId, expense, callback) {
    if (expense._id) {
        // updating an existing record
        var updateData = {
            categoryId: new ObjectId(expense.categoryId),
            affectedDate: new Date(expense.affectedDate),
            amount: expense.amount * 100,
            comment: expense.comment
        };

        BudgetEntries.update({_id: new ObjectId(expense._id)}, updateData, function (err, affected) {
            if (err) {
                return callback(err);
            }

            return callback(null);
        });
    }
    else {
        // saving a new record
        var newExpense = new BudgetEntries({
            categoryId: new ObjectId(expense.categoryId),
            userId: new ObjectId(userId),
            affectedDate: new Date(expense.affectedDate),
            amount: expense.amount * 100,
            comment: expense.comment
        });

        newExpense.save(function (err, expense) {
            if (err) {
                return callback(err);
            }

            return callback(null);
        });
    }
};

budgetEntryRepository.delete = function(userId, expenseId, callback) {
    var query = BudgetEntries.findOne({ 'userId' : new ObjectId(userId), "_id" : new ObjectId(expenseId)});
    query.remove(function (err) {
        if (err) {
            return callback(err);
        }

        return callback(null);
    });
};

function getDateRangeForMonth(dateString) {
    var initialDate = new Date(dateString);
    var year = initialDate.getYear();
    var month = initialDate.getMonth();

    var startDate = new Date();
    startDate.setYear(year + 1900);
    startDate.setMonth(month);
    startDate.setDate(1);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    var endDate = new Date();
    endDate.setYear(year + 1900);
    endDate.setMonth(month + 1);
    endDate.setDate(1);
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);

    return { startDate: startDate, endDate: endDate };
}

module.exports = budgetEntryRepository;