var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var BudgetEntrySchema = new mongoose.Schema({
    categoryId: {type: ObjectId, required: true},
    userId: {type: ObjectId, required: true},
    enteredDate: {type: Date, required: true},
    affectedDate: {type: Date, required: true},
    updatedDate: {type: Date, required: true},
    amount: {type: Number, required: true},
    comment: {type: String, required: false}
});

BudgetEntrySchema.methods.getAmount = function() {
    return (this.amount / 100).toFixed(2);
};

BudgetEntrySchema.methods.setAmount = function(amountToSet) {
    this.amount = amountToSet * 100;
};

BudgetEntrySchema.pre('validate', function(next) {
    if (typeof(this.enteredDate) === 'undefined' || this.enteredDate === null) {
        this.enteredDate = new Date();
    }

    this.updatedDate = new Date();
    next();
});

mongoose.model('BudgetEntry', BudgetEntrySchema);