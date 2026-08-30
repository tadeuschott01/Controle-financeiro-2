/* =====================================================
   CONTROLES - JAVASCRIPT
   Sistema financeiro
===================================================== */


/* ================= ESTADO ================= */


let transactions = [];

let currentType = "income";

let chart = null;





/* ================= ELEMENTOS ================= */


const modal =
document.getElementById("transactionModal");


const form =
document.getElementById("transactionForm");


const balanceValue =
document.getElementById("balanceValue");


const incomeValue =
document.getElementById("incomeValue");


const expenseValue =
document.getElementById("expenseValue");


const economyValue =
document.getElementById("economyValue");



const recentTransactions =
document.getElementById("recentTransactions");






/* ================= UTILIDADES ================= */


function money(value){

    return Number(value || 0)
    .toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

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

    modal?.classList.remove("hidden");

}



function closeModal(){

    modal?.classList.add("hidden");

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


/* ================= TIPO DE LANÇAMENTO ================= */


document
.querySelectorAll(".type-option")
.forEach(button=>{


    button.addEventListener(
        "click",
        ()=>{


            currentType =
            button.dataset.type;



            document
            .querySelectorAll(".type-option")
            .forEach(btn=>{

                btn.classList.remove("active");

            });



            button.classList.add("active");


        }
    );


});








/* ================= SALVAR LANÇAMENTO ================= */


form?.addEventListener(
"submit",
(e)=>{


    e.preventDefault();



    const description =
    document.getElementById(
        "descriptionInput"
    ).value.trim();




    const amount =
    Number(
        document.getElementById(
            "amountInput"
        ).value
    );




    const category =
    document.getElementById(
        "transactionCategory"
    ).value;




    const date =
    document.getElementById(
        "dateInput"
    ).value;




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





    transactions.unshift(
        transaction
    );





    saveData();





    form.reset();





    document.getElementById(
        "dateInput"
    ).value =
    new Date()
    .toISOString()
    .split("T")[0];





    closeModal();





    renderAll();



});








/* ================= CÁLCULOS ================= */



function calculate(){


    let income = 0;

    let expense = 0;



    transactions.forEach(item=>{


        if(item.type==="income"){

            income += item.amount;

        }
        else{

            expense += item.amount;

        }


    });




    return {

        income,

        expense,

        balance:
        income - expense


    };


}








/* ================= ATUALIZAR CARDS ================= */



function updateDashboard(){



    const result =
    calculate();




    if(balanceValue){

        balanceValue.textContent =
        money(result.balance);

    }




    if(incomeValue){

        incomeValue.textContent =
        money(result.income);

    }





    if(expenseValue){

        expenseValue.textContent =
        money(result.expense);

    }





    if(economyValue){


        let percent = 0;



        if(result.income > 0){


            percent =
            (
                (result.income-result.expense)
                /
                result.income
            )
            *
            100;


        }



        economyValue.textContent =
        percent.toFixed(0)+"%";


    }

   
}
   
/* ================= MOSTRAR TRANSAÇÕES ================= */


function renderTransactions(){


    if(!recentTransactions)
    return;



    if(transactions.length === 0){


        recentTransactions.innerHTML = `

        <div class="empty-state">

        Nenhuma movimentação ainda.

        </div>

        `;


        return;

    }





    recentTransactions.innerHTML =

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

            ${item.category}

            </small>



            </div>




            <div class="transaction-value ${item.type}">


            ${item.type==="income"?"+":"-"}

            ${money(item.amount)}


            </div>



            <button
            class="transaction-delete"
            onclick="deleteTransaction(${item.id})">

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
        item =>
        item.id !== id
    );



    saveData();



    renderAll();



}








/* ================= FILTROS ================= */



const searchInput =
document.getElementById(
"searchInput"
);



const typeFilter =
document.getElementById(
"typeFilter"
);



const categoryFilter =
document.getElementById(
"categoryFilter"
);






function updateCategories(){



    if(!categoryFilter)
    return;




    let categories = [];




    transactions.forEach(item=>{


        if(
        !categories.includes(item.category)
        ){

            categories.push(
                item.category
            );

        }


    });





    categoryFilter.innerHTML =

    `
    <option value="all">

    Todas categorias

    </option>
    `;




    categories.forEach(category=>{


        categoryFilter.innerHTML +=

        `

        <option value="${category}">

        ${category}

        </option>

        `;


    });



}






function filterTransactions(){


    let list =
    [...transactions];



    const search =
    searchInput?.value
    .toLowerCase()
    .trim();





    if(search){


        list =
        list.filter(item=>

            item.description
            .toLowerCase()
            .includes(search)

        );


    }





    if(
    typeFilter &&
    typeFilter.value !== "all"
    ){


        list =
        list.filter(item=>

            item.type ===
            typeFilter.value

        );


    }





}




searchInput?.addEventListener(
"input",
filterTransactions
);



typeFilter?.addEventListener(
"change",
filterTransactions
);


}


/* ================= TEMA ================= */


const themeBtn =
document.getElementById(
"themeBtn"
);



themeBtn?.addEventListener(
"click",
()=>{


    document.body
    .classList.toggle(
        "dark"
    );



    localStorage.setItem(

        "controleS_theme",

        document.body
        .classList.contains(
            "dark"
        )

    );


});





if(
localStorage.getItem(
"controleS_theme"
)==="true"
){

    document.body
    .classList.add(
        "dark"
    );

}







/* ================= NAVEGAÇÃO ================= */



document
.querySelectorAll(
"[data-section]"
)
.forEach(button=>{


    button.addEventListener(
    "click",
    ()=>{


        const target =
        button.dataset.section;



        document
        .querySelectorAll(
            ".section"
        )
        .forEach(section=>{


            section.classList.add(
                "hidden"
            );


        });




        document
        .getElementById(
            target
        )
        ?.classList.remove(
            "hidden"
        );





        document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(btn=>{


            btn.classList.remove(
                "active"
            );


        });




        button.classList.add(
            "active"
        );



    });

});








/* ================= USUÁRIO ================= */



function loadUser(){


    const user =
    localStorage.getItem(
        "controleS_user"
    )
    ||
    "Felipe";



    const name =
    document.getElementById(
        "userName"
    );



    const avatar =
    document.getElementById(
        "userAvatar"
    );



    const welcome =
    document.getElementById(
        "welcomeName"
    );



    if(name){

        name.textContent =
        user;

    }



    if(avatar){

        avatar.textContent =
        user.charAt(0)
        .toUpperCase();

    }



    if(welcome){

        welcome.textContent =
        user;

    }


}





/* ================= PLANO ================= */


function loadPlan(){


    const plan =
    localStorage.getItem(
        "controleS_plan"
    )
    ||
    "free";



    const element =
    document.getElementById(
        "userPlan"
    );



    if(!element)
    return;



    if(plan==="premium"){


        element.textContent =
        "ControleS Premium ⭐";


    }
    else{


        element.textContent =
        "ControleS Grátis";


    }



}








/* ================= GRÁFICO ================= */



function createChart(){


    const canvas =
    document.getElementById(
        "financeChart"
    );



    if(!canvas)
    return;




    const result =
    calculate();




    if(chart){

        chart.destroy();

    }





    chart =
    new Chart(
        canvas,
        {

        type:"doughnut",


        data:{


            labels:[

            "Receitas",

            "Despesas"

            ],


            datasets:[{

                data:[

                result.income,

                result.expense

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








/* ================= INICIALIZAÇÃO ================= */



function renderAll(){


    updateDashboard();

    renderTransactions();

    updateCategories();

    createChart();


}





function startApp(){



    loadData();


    loadUser();


    loadPlan();


    renderAll();



}






window.addEventListener(
"load",
()=>{


    startApp();


});








/* ================= LOGOUT ================= */


document
.getElementById(
"logoutBtn"
)
?.addEventListener(
"click",
()=>{


    localStorage.removeItem(
        "controleS_user"
    );



    location.reload();


});
