const Modal = {
    open() {
        // Abrir modal
        // Adicionar classe active ao modal
        document.querySelector(".modal-overlay")
            .classList
            .add("active")
    },
    close() {
        // Fechar modal
        // Remove clase active do Modal
        document.querySelector(".modal-overlay")
            .classList
            .remove("active")
    }
}

const Storage = {
    get() {
        debugger
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        // somar as entradas
        let income = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses() {
        // somar as saidas
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
        // entradas - saidas

        let total = 0;

        total = (Transaction.incomes() + Transaction.expenses())
        return total;;
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransactional(transaction)
        tr.dataset.index = index;
        DOM.transactionsContainer.append(tr)
    },
    innerHTMLTransactional(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
                    <td class="description">${transaction.description}</td>
                    <td class="${CSSclass}">${amount}</td>
                    <td class="date">${transaction.date}</td>
                    <td>
                        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                    </td>
                `
        return html;
    },
    updateBalance() {
        document.getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },
    formatDate(date) {
        const splited = date.split('-')

        return `${splited[2]}/${splited[1]}/${splited[0]}`
    },
    formatCurrency(value) {

        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value;
    }
}

const Form = {
    getValues() {
        return {
            description: document.querySelector('input#description').value,
            amount: document.querySelector('input#amount').value,
            date: document.querySelector('input#date').value,
        }
    },
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor preencha todos os campos!")
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            description,
            amount,
            date,
        }
    },
    clearFields() {
        document.querySelector('input#description').value = ""
        document.querySelector('input#amount').value = ""
        document.querySelector('input#date').value = ""
    },
    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction)
            Form.clearFields();
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}



const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()