/* ============================================================
   CONTROLES
   Script da página principal
   ControleS - Landing Page
============================================================ */


/* ================= ANO AUTOMÁTICO ================= */

const year = document.querySelector(".copyright");

if (year) {
    year.innerHTML =
    `© ${new Date().getFullYear()} ControleS. Todos os direitos reservados.`;
}


/* ================= MENU MOBILE ================= */

const header = document.querySelector(".header");

const nav = document.querySelector("nav");


const menuButton = document.createElement("button");

menuButton.className = "menu-mobile";

menuButton.innerHTML = "☰";


if(header && nav){

    header.appendChild(menuButton);


    menuButton.addEventListener("click",()=>{

        nav.classList.toggle("active");

        menuButton.classList.toggle("open");

    });


    document.querySelectorAll("nav a")
    .forEach(link=>{

        link.addEventListener("click",()=>{

            nav.classList.remove("active");

        });

    });

}



/* ================= ROLAGEM SUAVE ================= */


document.querySelectorAll('a[href^="#"]')
.forEach(link=>{


    link.addEventListener("click",function(e){

        const target =
        document.querySelector(
            this.getAttribute("href")
        );


        if(target){

            e.preventDefault();


            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

        }

    });


});



/* ================= BOTÕES PRINCIPAIS ================= */


const buttons =
document.querySelectorAll("button");


buttons.forEach(button=>{


    const text =
    button.textContent
    .toLowerCase();



    if(
        text.includes("começar") ||
        text.includes("criar conta")
    ){

        button.addEventListener("click",()=>{


            const login =
            document.querySelector("#login");


            if(login){

                login.scrollIntoView({

                    behavior:"smooth"

                });

            }


        });


    }



    if(
        text.includes("conhecer") ||
        text.includes("demonstração")
    ){


        button.addEventListener("click",()=>{


            const sistema =
            document.querySelector(
                ".demo-section"
            );


            if(sistema){

                sistema.scrollIntoView({

                    behavior:"smooth"

                });

            }


        });


    }


});



/* ================= ANIMAÇÃO AO ROLAR ================= */


const observer =
new IntersectionObserver((entries)=>{


    entries.forEach(entry=>{


        if(entry.isIntersecting){


            entry.target.classList.add(
                "show"
            );


        }


    });


},{

    threshold:0.15

});



const animatedElements =
document.querySelectorAll(
`
.system-card,
.resource-item,
.business-card,
.module-card,
.plan-card,
.demo-dashboard,
.app-window
`
);



animatedElements.forEach(element=>{

    element.classList.add("hidden-animation");

    observer.observe(element);

});



/* ================= FAQ ================= */


const faqItems =
document.querySelectorAll(
".faq-item"
);



faqItems.forEach(item=>{


    const title =
    item.querySelector("h3");


    const answer =
    item.querySelector("p");



    if(title && answer){


        answer.style.display="none";


        title.style.cursor="pointer";



        title.addEventListener("click",()=>{


            const open =
            answer.style.display==="block";



            document
            .querySelectorAll(".faq-item p")
            .forEach(p=>{

                p.style.display="none";

            });



            if(!open){

                answer.style.display="block";

            }


        });


    }


});

/* ================= EFEITO NOS CARDS FINANCEIROS ================= */


const numberCards =
document.querySelectorAll(
".hero-info strong, .dashboard-cards strong, .balance-box h2"
);



function animateNumber(element){


    const text =
    element.textContent;


    const number =
    parseFloat(
        text
        .replace(/[^\d,]/g,"")
        .replace(",",".")
    );


    if(isNaN(number)) return;



    let current = 0;


    const duration = 1200;


    const steps = 60;


    const increment =
    number / steps;



    const timer =
    setInterval(()=>{


        current += increment;



        if(current >= number){


            current = number;


            clearInterval(timer);


        }



        let formatted =
        current.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }
        );



        if(text.includes("R$")){

            element.textContent =
            "R$ " + formatted;


        }else{


            element.textContent =
            Math.floor(current) + "%";


        }



    },duration / steps);



}



const financeObserver =
new IntersectionObserver((entries)=>{


    entries.forEach(entry=>{


        if(entry.isIntersecting){


            animateNumber(entry.target);


            financeObserver.unobserve(
                entry.target
            );


        }


    });



});



numberCards.forEach(card=>{


    financeObserver.observe(card);


});




/* ================= EFEITO NO MOCKUP ================= */


const appWindow =
document.querySelector(
".app-window"
);



if(appWindow){


    appWindow.addEventListener(
        "mousemove",
        (event)=>{


            const rect =
            appWindow.getBoundingClientRect();



            const x =
            event.clientX - rect.left;


            const y =
            event.clientY - rect.top;



            const rotateX =
            ((y / rect.height)-0.5)*5;


            const rotateY =
            ((x / rect.width)-0.5)*5;



            appWindow.style.transform =
            `
            perspective(1000px)
            rotateX(${-rotateX}deg)
            rotateY(${rotateY}deg)
            scale(1.02)
            `;


        }
    );



    appWindow.addEventListener(
        "mouseleave",
        ()=>{


            appWindow.style.transform =
            "perspective(1000px) rotateX(0) rotateY(0) scale(1)";


        }
    );


}




/* ================= BOTÃO NOVO LANÇAMENTO DEMO ================= */


const demoButton =
document.querySelector(
".demo-header button"
);



if(demoButton){


    demoButton.addEventListener(
        "click",
        ()=>{


            alert(
            "Essa função estará disponível no aplicativo ControleS."
            );


        }
    );


}



/* ================= BOTÕES DOS PLANOS ================= */


const planButtons =
document.querySelectorAll(
".plan-card button"
);



planButtons.forEach(button=>{


    button.addEventListener(
        "click",
        ()=>{


            const login =
            document.querySelector(
                "#login"
            );



            if(login){


                login.scrollIntoView({

                    behavior:"smooth"

                });


            }


        }
    );


});




/* ================= EFEITO NOS RECURSOS ================= */


const resources =
document.querySelectorAll(
".resource-item"
);



resources.forEach(item=>{


    item.addEventListener(
        "mouseenter",
        ()=>{


            item.style.transform =
            "translateY(-8px)";


        }
    );



    item.addEventListener(
        "mouseleave",
        ()=>{


            item.style.transform =
            "translateY(0)";


        }
    );



});




/* ================= HEADER AO ROLAR ================= */


window.addEventListener(
"scroll",
()=>{


    if(!header) return;



    if(window.scrollY > 50){


        header.classList.add(
            "scrolled"
        );


    }else{


        header.classList.remove(
            "scrolled"
        );


    }


});
/* ================= SEGURANÇA CONTRA ELEMENTOS AUSENTES ================= */


function exists(selector){

    return document.querySelector(selector) !== null;

}



/* ================= STATUS VISUAL DOS BOTÕES ================= */


document
.querySelectorAll("button")
.forEach(button=>{


    button.addEventListener(
        "mousedown",
        ()=>{

            button.style.transform =
            "scale(.97)";

        }
    );



    button.addEventListener(
        "mouseup",
        ()=>{

            button.style.transform =
            "";

        }
    );


});




/* ================= ATUALIZA TEXTO DO PLANO ================= */


const premiumTexts =
document.querySelectorAll(
".price"
);



premiumTexts.forEach(price=>{


    if(
        price.textContent.includes("24,99")
    ){

        price.dataset.plan =
        "premium";

    }


});




/* ================= SIMULAÇÃO DE ATUALIZAÇÃO DO DASHBOARD ================= */


const chartBars =
document.querySelectorAll(
".bars div"
);



if(chartBars.length){


    chartBars.forEach((bar,index)=>{


        const height =
        bar.style.height;



        bar.style.height="0";



        setTimeout(()=>{


            bar.style.height =
            height;


        },300 + (index * 150));



    });



}




/* ================= OBSERVADOR FINAL ================= */


const sections =
document.querySelectorAll(
"section"
);



const sectionObserver =
new IntersectionObserver(
(entries)=>{


    entries.forEach(entry=>{


        if(entry.isIntersecting){


            entry.target.classList.add(
                "visible"
            );


        }


    });



},
{

    threshold:.1

});



sections.forEach(section=>{


    sectionObserver.observe(section);


});




/* ================= PREVENIR LINKS VAZIOS ================= */


document
.querySelectorAll('a[href="#"]')
.forEach(link=>{


    link.addEventListener(
        "click",
        event=>{


            event.preventDefault();


        }
    );


});




/* ================= INICIALIZAÇÃO ================= */


document.addEventListener(
"DOMContentLoaded",
()=>{


    console.log(
        "ControleS carregado com sucesso."
    );



    const premium =
    document.querySelector(
        ".premium"
    );



    if(premium){


        premium.classList.add(
            "highlight"
        );


    }



});
