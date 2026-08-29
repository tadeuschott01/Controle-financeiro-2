alert("APP JS CARREGOU");
/* =====================================================
   CONTROLES - APP JAVASCRIPT
   Sistema financeiro
===================================================== */


/* ================= ESTADO ================= */

let transactions = [];

let currentType = "income";



/* ================= ELEMENTOS ================= */


const modal = document.getElementById("transactionModal");

const form = document.getElementById("transactionForm");

const transactionsList =
document.getElementById("recentTransactions");


const balance =
document.getElementById("balanceValue");

const income =
document.getElementById("incomeValue");

const expense =
document.getElementById("expenseValue");

const economy =
document.getElementById("economyValue");



/* ================= UTIL ================= */


function money(value){

    return Number(value || 0)
    .toLocaleString("pt-BR",{

        style:"currency",
        currency:"BRL"

    });

}




function saveData(){

    localStorage.setItem(
        "controleS_transactions",
        JSON.stringify(transactions)
    );

}



function loadData(){

    const data =
    localStorage.getItem(
        "controleS_transactions"
    );


    if(data){

        transactions =
        JSON.parse(data);

    }

}



/* ================= MODAL ================= */


function openModal(){

    modal.classList.remove("hidden");

}



function closeModal(){

    modal.classList.add("hidden");

}



document
.getElementById("openTransactionBtn")
?.addEventListener(
"click",
openModal
);



document
.getElementById("closeModal")
?.addEventListener(
"click",
closeModal
);



document
.querySelector(".modal-overlay")
?.addEventListener(
"click",
closeModal
);





/* ================= TIPO ================= */


document
.querySelectorAll(
"[data-type]"
)
.forEach(button=>{


button.addEventListener(
"click",()=>{


currentType =
button.dataset.type;


document
.querySelectorAll("[data-type]")
.forEach(btn=>{

btn.classList.remove("active");

});


button.classList.add("active");


});


});

/* ================= ADICIONAR TRANSAÇÃO ================= */


form?.addEventListener(
"submit",
function(e){

    e.preventDefault();


    const description =
    document.getElementById("descriptionInput").value;


    const amount =
    Number(
        document.getElementById("amountInput").value
    );


    const category =
    document.getElementById("transactionCategory").value;


    const date =
    document.getElementById("dateInput").value;



    if(!description || !amount){

        alert(
        "Preencha os campos obrigatórios."
        );

        return;

    }



    const transaction = {


        id:
        Date.now(),


        type:
        currentType,


        description,


        amount,


        category,


        date



    };



    transactions.unshift(transaction);



    saveData();



    form.reset();



    closeModal();



    renderAll();


});





/* ================= CÁLCULOS ================= */


function calculate(){


    let totalIncome = 0;

    let totalExpense = 0;



    transactions.forEach(item=>{


        if(item.type === "income"){

            totalIncome += item.amount;

        }
        else{

            totalExpense += item.amount;

        }


    });



    return {


        income:
        totalIncome,


        expense:
        totalExpense,


        balance:
        totalIncome - totalExpense


    };


}






/* ================= ATUALIZAR DASHBOARD ================= */


function updateDashboard(){



    const result =
    calculate();



    if(balance){

        balance.textContent =
        money(result.balance);

    }




    if(income){

        income.textContent =
        money(result.income);

    }




    if(expense){

        expense.textContent =
        money(result.expense);

    }




    if(economy){


        let percent = 0;


        if(result.income > 0){


            percent =
            ((result.income-result.expense)
            /
            result.income)
            *
            100;


        }



        economy.textContent =
        percent.toFixed(0)+"%";


    }



}







/* ================= MOSTRAR TRANSAÇÕES ================= */


function renderTransactions(){


    if(!transactionsList)
    return;



    if(transactions.length === 0){


        transactionsList.innerHTML = `

        <div class="empty-state">

        Nenhuma movimentação ainda.

        </div>

        `;


        return;


    }





    transactionsList.innerHTML =

    transactions
    .slice(0,10)
    .map(item=>{


        return `


        <div class="transaction">


            <div class="transaction-icon">

            ${item.type==="income"?"↗":"↘"}

            </div>



            <div class="transaction-info">

            <strong>
            ${item.description}
            </strong>


            <small>
            ${item.category || "Sem categoria"}
            </small>


            </div>



            <div class="transaction-value 
            ${item.type}">


            ${item.type==="income"?"+":"-"}
            ${money(item.amount)}


            </div>



            <button
            onclick="deleteTransaction(${item.id})"
            class="transaction-delete">

            ×

            </button>


        </div>


        `;


    })
    .join("");



}






/* ================= EXCLUIR ================= */


function deleteTransaction(id){


    transactions =
    transactions.filter(
        item=>item.id !== id
    );


    saveData();


    renderAll();


}

/* ================= FILTROS ================= */


const searchInput =
document.getElementById("searchInput");


const typeFilter =
document.getElementById("typeFilter");


const categoryFilter =
document.getElementById("categoryFilter");




function filterTransactions(){


    let result =
    [...transactions];



    const search =
    searchInput?.value
    .toLowerCase()
    .trim();



    if(search){


        result =
        result.filter(item=>

            item.description
            .toLowerCase()
            .includes(search)

        );


    }



    if(typeFilter?.value !== "all"){


        result =
        result.filter(item=>

            item.type === typeFilter.value

        );


    }



    renderFiltered(result);


}





function renderFiltered(list){



    if(!transactionsList)
    return;



    if(list.length===0){


        transactionsList.innerHTML = `

        <div class="empty-state">

        Nenhuma transação encontrada.

        </div>

        `;


        return;


    }



    transactionsList.innerHTML =

    list.map(item=>`


    <div class="transaction">


        <div class="transaction-icon">

        ${item.type==="income"?"↗":"↘"}

        </div>



        <div class="transaction-info">


        <strong>
        ${item.description}
        </strong>


        <small>

        ${item.category}

        </small>


        </div>



        <div class="transaction-value ${item.type}">


        ${item.type==="income"?"+":"-"}
        ${money(item.amount)}


        </div>


    </div>


    `).join("");



}



searchInput?.addEventListener(
"input",
filterTransactions
);


typeFilter?.addEventListener(
"change",
filterTransactions
);







/* ================= CATEGORIAS ================= */


function updateCategories(){


    if(!categoryFilter)
    return;



    let categories = [];


    transactions.forEach(item=>{


        if(
        !categories.includes(item.category)
        ){

            categories.push(item.category);

        }


    });



    categoryFilter.innerHTML =

    `<option value="all">
    Todas categorias
    </option>`;



    categories.forEach(category=>{


        categoryFilter.innerHTML +=

        `

        <option value="${category}">

        ${category}

        </option>

        `;


    });



}








/* ================= GRÁFICO ================= */


let chart;



function createChart(){


    const canvas =
    document.getElementById(
    "financeChart"
    );


    if(!canvas)
    return;



    const data =
    calculate();



    if(chart){

        chart.destroy();

    }





    chart =
    new Chart(canvas,{


        type:"doughnut",


        data:{


            labels:[

            "Receitas",

            "Despesas"

            ],


            datasets:[{

                data:[

                data.income,

                data.expense

                ],


                backgroundColor:[

                "#2f6b50",

                "#f28c28"

                ]


            }]


        },


        options:{


            responsive:true,


            maintainAspectRatio:false


        }



    });



}







/* ================= TEMA ESCURO ================= */


const themeBtn =
document.getElementById("themeBtn");



themeBtn?.addEventListener(
"click",
()=>{


document.body
.classList.toggle("dark");



localStorage.setItem(

"controleS_theme",

document.body
.classList.contains("dark")

);



});





if(
localStorage.getItem(
"controleS_theme"
)==="true"
){

document.body.classList.add("dark");

}

/* ================= BOTÕES DE NAVEGAÇÃO ================= */


document
.querySelectorAll("[data-section]")
.forEach(button=>{


    button.addEventListener(
    "click",
    ()=>{


        const target =
        button.dataset.section;



        document
        .querySelectorAll(".section")
        .forEach(section=>{


            section.classList.add("hidden");


        });



        const active =
        document.getElementById(target);



        if(active){

            active.classList.remove("hidden");

        }



        document
        .querySelectorAll("[data-section]")
        .forEach(btn=>{

            btn.classList.remove("active");

        });



        button.classList.add("active");


    });


});






/* ================= MENU MOBILE ================= */


const mobileMenu =
document.getElementById("mobileMenu");



mobileMenu?.addEventListener(
"click",
()=>{


document
.querySelector(".sidebar")
.classList.toggle("open");


});






/* ================= LOGIN SIMPLES ================= */


const loginForm =
document.getElementById("loginForm");



loginForm?.addEventListener(
"submit",
(e)=>{


e.preventDefault();


const name =
document.getElementById("loginName")?.value
||
"Felipe";



localStorage.setItem(
"controleS_user",
name
);



startApp();


});







/* ================= USUÁRIO ================= */


function loadUser(){


const user =
localStorage.getItem(
"controleS_user"
);



const userName =
document.getElementById("userName");



if(userName && user){

    userName.textContent =
    user;

}



}








/* ================= INICIALIZAÇÃO ================= */


function startApp(){


loadData();


loadUser();


updateDashboard();


renderTransactions();


updateCategories();


createChart();



}





window.addEventListener(
"load",
()=>{


startApp();


});







/* ================= DATA AUTOMÁTICA ================= */


const dateInput =
document.getElementById(
"dateInput"
);



if(dateInput){


const today =
new Date()
.toISOString()
.split("T")[0];



dateInput.value =
today;


}







/* ================= LOGOUT ================= */


const logoutBtn =
document.getElementById(
"logoutBtn"
);



logoutBtn?.addEventListener(
"click",
()=>{


localStorage.removeItem(
"controleS_user"
);



location.reload();


});
document.getElementById("openTransactionBtn").onclick = function(){

alert("BOTÃO FUNCIONOU");

};
