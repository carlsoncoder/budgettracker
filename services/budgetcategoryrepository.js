var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var BudgetCategories = mongoose.model('BudgetCategory');

var budgetCategoryRepository = {};

budgetCategoryRepository.loadAll = function(userId, callback) {
    var query = BudgetCategories.find({ 'userId' : new ObjectId(userId) }, 'name description budgetedAmount').sort('name');

    query.exec(function (err, categories) {
        if (err) {
            return callback(err);
        }

        return callback(null, categories);
    });
};

budgetCategoryRepository.save = function(userId, category, callback) {
    budgetCategoryRepository.loadAll(userId, function(err, categories) {
        if (err) {
            return callback(err);
        }
        else {
            if (category._id) {
                // updating an existing record
                for (var i = 0; i < categories.length; i++) {
                    if ((categories[i].name === category.name) && (categories[i]._id.toString() !== category._id.toString())) {
                        return callback("A category with the name '" + category.name + "' already exists");
                    }
                }

                var updateData = {
                    name: category.name,
                    description: category.description,
                    budgetedAmount: category.budgetedAmount * 100
                };

                BudgetCategories.update({_id: new ObjectId(category._id)}, updateData, function (err, affected) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null);
                });
            }
            else {
                // saving a new record
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i].name === category.name) {
                        return callback("A category with the name '" + category.name + "' already exists");
                    }
                }

                var newCategory = new BudgetCategories({
                    userId: new ObjectId(userId),
                    name: category.name,
                    description: category.description
                });

                newCategory.setBudgetedAmount(category.budgetedAmount);
                newCategory.save(function (err, cat) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null);
                });
            }
        }
    });
};

budgetCategoryRepository.delete = function(userId, categoryId, callback) {
    var query = BudgetCategories.findOne({ 'userId' : new ObjectId(userId), "_id" : new ObjectId(categoryId)});
    query.remove(function (err) {
        if (err) {
            return callback(err);
        }

        return callback(null);
    });
};

module.exports = budgetCategoryRepository;