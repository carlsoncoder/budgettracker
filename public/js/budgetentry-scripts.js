// NOTE: Bootstrap has been modified to have the @grid-float-breakpoint value be 1200px - if that is changed, change this as well
var bootstrap_grid_float_breakpoint_pixel_value = 1200;

var enterExpenseSectionLinkId = '#enterExpenseSectionLink';
var budgetComparisonSectionLinkId = '#budgetComparisonSectionLink';
var budgetChartSectionLinkId = '#budgetChartSectionLink';
var manageCategoriesSectionLinkId = '#manageCategoriesSectionLink';

/// <summary>
/// Handles JavaScript code that must run when a given Angular controller is initialized.
/// </summary>
/// <param name="sectionLinkID">The ID of the main section of the application we have loaded.</param>
function initializeOnControllerLoad(sectionLinkID) {
    // set the active menu item in the navbar
    $('.sectionLink').removeClass('active');
    $(sectionLinkID).addClass('active');

    // we need to scroll to the top when a user navigates to a new page
    $("html, body").animate({ scrollTop: 0 }, "slow");
}

/// <summary>
/// Formats a string in the format "YYYY-MM" to a format of "MONTH NAME YYYY".
/// Turns "2015-04" into "April 2015".
/// </summary>
/// <param name="message">The date string in the format 'YYYY-MM' to be formatted.</param>
/// <returns>The formatted date string.</returns>
function formatMonthString(monthString) {
    var year = monthString.substring(0, 4);
    var month = monthString.substring(5,7);
    var displayMonth = '';

    switch (month)
    {
        case '01':
        {
            displayMonth = 'January';
            break;
        }
        case '02':
        {
            displayMonth = 'February';
            break;
        }
        case '03':
        {
            displayMonth = 'March';
            break;
        }
        case '04':
        {
            displayMonth = 'April';
            break;
        }
        case '05':
        {
            displayMonth = 'May';
            break;
        }
        case '06':
        {
            displayMonth = 'June';
            break;
        }
        case '07':
        {
            displayMonth = 'July';
            break;
        }
        case '08':
        {
            displayMonth = 'August';
            break;
        }
        case '09':
        {
            displayMonth = 'September';
            break;
        }
        case '10':
        {
            displayMonth = 'October';
            break;
        }
        case '11':
        {
            displayMonth = 'November';
            break;
        }
        case '12':
        {
            displayMonth = 'December';
            break;
        }
        default:
        {
            displayMonth = 'UNKNOWN';
            break;
        }
    }

    return displayMonth + ' ' + year;
}

/// <summary>
/// Determines the available viewport width.
/// </summary>
/// <returns>The available width of the viewport.</returns>
function getViewPortWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

/// <summary>
/// Determines the available viewport height.
/// </summary>
/// <returns>The available height of the viewport.</returns>
function getViewPortHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

/// <summary>
/// Determines if the object value is null or undefined.
/// </summary>
/// <param name="obj">The object to be evaluated.</param>
/// <returns>True if the object is null or undefined, otherwise false.</returns>
function isNullOrUndefined(obj) {
    return typeof (obj) === 'undefined' || obj === null;
}

/// <summary>
/// Determines if an object is a number.
/// </summary>
/// <param name="numberToCheck">The object to be evaluated.</param>
/// <returns>True if the object is a number, otherwise false.</returns>
function isNumber(numberToCheck) {
    return !isNaN(parseFloat(numberToCheck)) && isFinite(numberToCheck);
}

/// <summary>
/// Determines if we are in a mobile viewport.
/// </summary>
/// <returns>True if the viewport is 'mobile' width, otherwise false.</returns>
function isMobileViewPort() {

    var viewportWidth = getViewPortWidth();
    return viewportWidth < bootstrap_grid_float_breakpoint_pixel_value;
}

/// <summary>
/// Formats an amount string to a proper value including a dollar sign.
/// </summary>
/// <param name="amountValue">The amount to be formatted.</param>
/// <returns>The formatted string.</returns>
function formatAmountString(amountValue) {
    var amountString = amountValue.toString();
    if (amountString.length === 4) {
        return '$' + amountString.substring(0, 1) + ',' + amountString.substring(1, 4);
    }
    else if (amountString.length === 5) {
        return '$' + amountString.substring(0, 2) + ',' + amountString.substring(2, 6);
    }
    else {
        return '$' + amountString;
    }
}

/// <summary>
/// Formats a date string to a proper value for chart display.
/// </summary>
/// <param name="dateValue">The date string to be formatted.</param>
/// <returns>The formatted string.</returns>
function formatDateForChart(dateValue) {
    var date = new Date(dateValue.toString());
    return moment(date).format('MMMM YYYY');
}

/// <summary>
/// Creates a new CacheContainer object used to store simple cache arrays in memory.
/// </summary>
/// <param name="cacheLength">The age of the cache, in milliseconds.</param>
/// <returns>A new CacheContainer object.</returns>
function CacheContainer(cacheLength) {
    this.updatedOn = new Date();
    this.cachedData = [];
    this.cacheLengthInMs = cacheLength;
    this.isValid = function() {
        if (this.cachedData.length === 0) {
            return false;
        }

        var diffInMilliSeconds = Math.floor((new Date() - this.updatedOn));
        if (diffInMilliSeconds > this.cacheLengthInMs) {
            // clear array
            this.cachedData = [];
            return false;
        }

        return true;
    };

    this.assignData = function(newData) {
        this.updatedOn = new Date();
        this.cachedData = newData;
    };

    this.clearCache = function() {
        this.cachedData = [];
    };

    return this;
}