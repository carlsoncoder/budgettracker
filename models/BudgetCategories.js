var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var BudgetCategorySchema = new mongoose.Schema({
    userId: {type: ObjectId, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    budgetedAmount: {type: Number, required: true}
});

BudgetCategorySchema.methods.getBudgetedAmount = function() {
    return (this.budgetedAmount / 100).toFixed(2);
};

BudgetCategorySchema.methods.setBudgetedAmount = function(amountToSet) {
    this.budgetedAmount = amountToSet * 100;
};

mongoose.model('BudgetCategory', BudgetCategorySchema);