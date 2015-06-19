var express = require('express');
var router = express.Router();
var budgetCategoryRepository = require('../services/budgetcategoryrepository');
var budgetEntryRepository = require('../services/budgetentryrepository');
var jwt = require('express-jwt');
var configOptions = require('../config/config.js');

var auth = jwt({secret: configOptions.JWT_SECRET_KEY, userProperty: 'payload'});

// GET '/budget/categories'
router.get('/categories', auth, function(req, res, next) {
    budgetCategoryRepository.loadAll(req.payload._id, function(err, records) {
       if (err) {
           return res.status(500).json(err);
       }

        return res.status(200).json(records);
    });
});

// POST /budget/deletecategory
router.post('/deletecategory', auth, function(req, res, next) {
    budgetCategoryRepository.delete(req.payload._id, req.body.categoryId, function(err) {
       if (err) {
           return res.status(500).json(err);
       }

       return res.json("Delete Successful").status(200);
    });
});

// POST /budget/savecategory
router.post('/savecategory', auth, function(req, res, next) {
    budgetCategoryRepository.save(req.payload._id, req.body.category, function(err) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json("Save Successful");
    });
});

// GET /budget/expensesformonth
router.get('/expensesformonth', auth, function(req, res, next) {
    budgetEntryRepository.loadByMonth(req.payload._id, req.query.loadDate, function(err, expenses) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(expenses);
    });
});

// GET /budget/expensedetailsformonthandcategory
router.get('/expensedetailsformonthandcategory', auth, function(req, res, next) {
    budgetEntryRepository.loadDetailsByMonthAndCategory(req.payload._id, req.query.categoryId, req.query.loadDate, function(err, expenseDetails) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(expenseDetails);
    });
});

// GET /budget/expensedetail
router.get('/expensedetail', auth, function(req, res, next) {
    budgetEntryRepository.loadSpecificExpense(req.payload._id, req.query.expenseId, function(err, expense) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(expense);
    });
});

// POST /budget/deleteexpense
router.post('/deleteexpense', auth, function(req, res, next) {
    budgetEntryRepository.delete(req.payload._id, req.body.expenseId, function(err) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json("Delete Successful");
    });
});

// POST /budget/saveexpense
router.post('/saveexpense', auth, function(req, res, next) {
    budgetEntryRepository.save(req.payload._id, req.body.expense, function(err) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json("Save Successful");
    });
});

// GET /budget/chartdetailsbycategory
router.get('/chartdetailsbycategory', auth, function(req, res, next) {
    budgetEntryRepository.loadChartData(req.payload._id, req.query.categoryId, function(err, chartData) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(chartData);
    });
});

module.exports = router;