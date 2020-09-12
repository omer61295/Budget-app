


var budgetController = (function() {
    
    
    //income object constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    //expense object constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    
    //calculates percentage of a given expense
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };
    
    
    //allows percentage of element to be public
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    
    //calculates sum of inc/exp
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(curr) {
                sum +=  curr.value;
        });
        data.totals[type] = sum;
    };
    
    
    //data structre object to contain all data (expenses, incomes and total amounts)
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    return {
        
        //adds new item to data object
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if(data.allItems[type].length !== 0) {                                  //type = 'exp'/'inc' (same name as allItems arrays)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    //new id is the id of the last item in exp/inc + 1
            }
            else {
                ID = 0;
            }
                
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);                                  //puts new item in the exp/inc
            
            return newItem;
        },
        
        
        //removes existing item from data object
        deleteItem: function(type, id) {
            
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        
        //updates total incomes, total expenses, total budget and percentage of total expenses
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        
        
        //updates all expenses' percentages
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);  
            });
        },
        
        
        //returns a list of all percentages of expenses in order
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        //returns total budget, total inc, total exp and total percentage
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        
        //debugging function
        testing: function() {
            console.log(data);
        }
        
        
    };
    
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var UIController = (function() {
    
    
    //contains all HTML relevant id's
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    
    var formatNumber = function (num, type) {
         var numSplit, int, dec;
         num = Math.abs(num);
         num = num.toFixed(2);
         
         numSplit = num.split('.');
         dec = numSplit[1];
         int = numSplit[0];
         
         for (var i = int.length - 3; i > 0; i = i - 3) {
             int = int.slice(0, i) + ',' + int.slice(i, int.length);
         }
        
         return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    };
    
    
    var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i] , i);
                }
            };
    
    return {
        //allows input to be public 
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        
        //displays new item in inc/exp table
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            if (type === 'exp') {                                                               //determines the correct html block and if inc/exp
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);                                             //specifies html block to new item
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            newHtml = newHtml.replace('%description%', obj.description);
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);           //adds html block
        },
        
        
        //deletes HTML code of a removed item
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);   
        },
        
        
        //clears input fields after submission
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //returns a list of all elements
            
            fieldsArr = Array.prototype.slice.call(fields);                                     //changes the list (fields) to an array (fieldsArr)
            
            fields.forEach( function(current, index, array) {                                   //changes each of the elements' value to ""
                current.value = "";
            });
                           
            fieldsArr[0].focus();                                                               //changes focus to description field             
        },
        
        
        //displays total budget, total inc, total exp and total percentage
        displayBudget: function(obj) {
            
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, '+');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, '-');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        
        //displays all expenses' percentages
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayDate: function () {
            
            var now, month;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();
        },
        
        
        changedType: function() {
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        

        //allows DOM to be public
        getDOM: function() {
            return DOMstrings;
        }
        
        
    };
    
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var controller = (function(bdgtCtrlr, UICtrlr) {
    
    
    //contains all event listeners
    var setupEventListener = function() {
        var DOMstrings = UICtrlr.getDOM();
        
        document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress' , function(event) {
            if (event.keyCode === 13 || event.wich === 13) {
                ctrlAddItem()
            }   
        });
        
        document.querySelector(DOMstrings.container).addEventListener('click' , ctrlDeleteItem);
        
        document.querySelector(DOMstrings.inputType).addEventListener('change' , UICtrlr.changedType);
    };
    
    
    //updates budget amounts
    var updateBudget = function() {
        bdgtCtrlr.calculateBudget();
        
        var budget = bdgtCtrlr.getBudget();
        
        UICtrlr.displayBudget(budget);
    };
    
    
    //updates percentages on expenses
    var updatePercentages = function() {
        
        bdgtCtrlr.calculatePercentages();
        
        var percentages = bdgtCtrlr.getPercentages();
        
        UICtrlr.displayPercentages(percentages);
    };
          
    
    //adds new item
    var ctrlAddItem = function () {
        var input, newItem;
        input = UICtrlr.getInput();                                                     //get input data
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {       //checks that all input fields are valid and not empty
            newItem = bdgtCtrlr.addItem(input.type, input.description, input.value);    //adds item to data structure

            UICtrlr.addListItem(newItem, input.type);                                   //displays new item

            UICtrlr.clearFields();                                                      //clears input fields after submission
            
            updateBudget();                                                             //updates budget sums
            
            updatePercentages();
        }
    }
    
    
    //removes an existing item
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            bdgtCtrlr.deleteItem(type, ID);
            
            UICtrlr.deleteListItem(itemID);
            
            updateBudget();
            
            updatePercentages();
        }
    };
    
    return {
        
        
        //initializes all data
        init: function() {
            console.log('Application has started.')
            UICtrlr.displayDate();
            UICtrlr.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListener()
        }
        
        
    }
    
})(budgetController, UIController);




controller.init();


