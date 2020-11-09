const addExpense = document.getElementById("add-expense");
const addExpenseMenu = document.getElementById("add-expense-menu");
const addExpensePrice = document.getElementById("add-expense-price");
const addExpenseSubmit = document.getElementById("add-expense-submit");
const addPerson = document.getElementById("add-person");
const addPersonName = document.getElementById("add-person-name");
const addPersonSubmit = document.getElementById("add-person-submit");
const table = document.getElementById("summary-table");

let defaultChecked = true;

var people = [];
var expenses = [];
var nRows = 2;
var nCols = 2;

function createExpense(menu,price,total) {
    this.menu = menu;
    this.price = price;
    this.total = total;
}

function calculateEachExpense(expense) {
    let price = expense.price;
    let count = 0;
    let total = 0;

    // CALCULATE FOR DIVIDER
    for (person of people) {
        if (expense[person].paticipate) {
            count += 1;
        }
    }
    let payment = price/count;

    // ASSIGN PAY AMOUNT TO EACH PATICIPANT
    for (person of people) {
        if (expense[person].paticipate) {
            expense[person].pay = payment;
            total += payment;
        } else {
            expense[person].pay = 0;
        }
    }
    // ASSIGN TOTAL PROPS FOR EXPENSE
    expense.total = total;
}

function updatePayment() {
    for (expense of expenses) {
        calculateEachExpense(expense);
    }
}

function updatePaticipants() {
    for (expense of expenses) {
        for (person of people) {
            if (typeof(expense[person]) === 'undefined') {
                expense[person] = {
                    paticipate: defaultChecked,
                    pay: 0
                };
            }
        }
    }
}

//Just insert 1 cell
function insertExpense(expense) {
    var insertedRow = table.insertRow(expenses.length);

    insertedRow.insertCell(0).innerHTML = `${expense.menu}(${expense.price})`;

    nRows += 1;
}

//Just insert 2 cells, header and footer at position insertedCol
function insertPerson(person) {
    var tableHeader = table.rows[0];
    var tableFooter = table.rows[table.rows.length-1];
    var insertedCol = people.length;

    tableHeader.insertCell(insertedCol).innerHTML = person;
    tableFooter.insertCell(insertedCol).innerHTML = 'from insertPerson';

    nCols += 1;
}

function notHeader(row) {
    return (row.rowIndex !== 0);
}

function notFooter(row) {
    return (row.rowIndex !== nRows-1)
}

function notMenu(cell) {
    return (cell.cellIndex !== 0);
}

function notTotal(cell) {
    return (cell.cellIndex !== nCols-1);
}

function sumPerson(peopleIndex) {
    let sum = 0;
    for (let expense of expenses) {
        sum += expense[people[peopleIndex]].pay;
    }
    return sum;
}

function createCheckbox(cell,id) {
    //type of id === string
    let checkbox = document.createElement('input');
    let label = document.createElement('label');
    checkbox.type = 'checkbox';
    checkbox.checked = defaultChecked;
    checkbox.name = id;
    checkbox.id = id;

    label.htmlFor = id;
    
    cell.append(checkbox);
    cell.append(label);

    checkbox.addEventListener('change', (event) => {
        let i = event.target.id[0]-1;
        let j = event.target.id[1]-1;
        expenses[i][people[j]].paticipate = !expenses[i][people[j]].paticipate;
        updateValue();
    });
}

function alreadyHasCheckbox(i,j) {
    if (document.getElementById([i]+[j]) === null) {
        return false;
    } else {
        return true;
    }
}

function updateTable() {
    for (let row of table.rows) {
        while (row.cells.length < nCols) {
            if (row.cells.length-1 === 0) {
                let insertedCell = row.insertCell();
                insertedCell.innerHTML = ''; //form update table
            } else {
                let insertedCell = row.insertCell(row.cells.length-1);
                insertedCell.innerHTML = ''; //form update table
            }
        }
    }
}

function updateValue() {
    updatePayment();
    for (let row of table.rows) {
        for (let cell of row.cells) {
            if (notHeader(row) && notFooter(row) && notMenu(cell) && notTotal(cell)) { //is pay value cell?
                // console.log([row.rowIndex]+[cell.cellIndex],alreadyHasCheckbox(row.rowIndex,cell.cellIndex));
                if (!alreadyHasCheckbox(row.rowIndex,cell.cellIndex)) {
                    let id = [row.rowIndex] + [cell.cellIndex];
                    createCheckbox(cell,id);
                }
                cell.children[1].innerHTML = expenses[row.rowIndex-1][people[cell.cellIndex-1]].pay;
            } else if (notHeader(row) && notMenu(cell) && notTotal(cell) && !notFooter(row)) { //is sum person cell?
                cell.innerHTML = sumPerson(cell.cellIndex-1);
            } else if (notHeader(row) && notMenu(cell) && notFooter(row) && !notTotal(cell)) { //is total menu cell? 
                cell.innerHTML = expenses[row.rowIndex-1].total;
            } else if (!notTotal(cell) && !notFooter(row)) { //is total (down right) cell?
                cell.innerHTML = expenses.reduce((acc,curr) => {
                    return acc+curr.total;
                },0);
            }
        }
    }
}

addExpense.addEventListener('submit',(event) => {
    event.preventDefault();
    var newExpense = new createExpense(addExpenseMenu.value,addExpensePrice.value,0);
    expenses.push(newExpense);
    updatePaticipants();
    insertExpense(newExpense);
    updateTable();
    updateValue();
    addExpenseMenu.value = '';
    addExpensePrice.value = '';
});

addPerson.addEventListener('submit', (event) => {
    event.preventDefault();
    for (expense of expenses) {
        expense[addPersonName.value] = {
            paticipate: defaultChecked,
            pay: 0
        };
    }
    people.push(addPersonName.value);
    insertPerson(addPersonName.value);
    updateTable();
    updateValue();
    addPersonName.value = '';
});