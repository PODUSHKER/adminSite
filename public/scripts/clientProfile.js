const seconds = Number(document.querySelector('.timeout-seconds').getAttribute('value'))

setTimeout(async () => {
    await fetch('/deleteTempData', { method: 'POST' })
    location.replace('/')
}, seconds * 1000);

const urls = document.querySelectorAll('.sidebar a');
[...urls].forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault()
        const url = e.target.getAttribute('href')
        location.replace(url)
    })
})


const subBtn = document.querySelector('.subscription-btn')
const subList = document.getElementById('subscriptions')
if (subBtn) {
    subBtn.addEventListener('click', async (e) => {

        const { subscription, products } = await (await fetch('/api/registerSubscriptionTool', {
            method: 'POST',
            body: JSON.stringify({ subscriptionId: subList.value }),
            headers: {
                'Content-Type': 'application/json'
            }
        })).json()
        subList.outerHTML = '';
        subBtn.outerHTML =
            `
                    <div class="subscription-section">
                        <h2>Статус: <span class="subscription-status">Активен</span></h2>
                        <div class="subscription-details">
                            <span class="subscription-name">${subscription.title}</span>
                            <span class="subscription-end">До окончания: ${subscription.timeToLive} дней</span>
                        </div>
    
                        <div class="products-section">
                            ${products.reduce((acc, el) => acc +=
                `<div class="product-item">
                                <span>${el.name} - ${el.quantity} шт.</span>
                                <button type="button" id="product${el.id}" class="btn deduct-btn">Списать</button>
                            </div>`, '')}
                        </div>
                    </div>
                    `
        const deductBtns = document.querySelectorAll('.deduct-btn')
        for (let btn of deductBtns) {
            btn.addEventListener('click', deductButtonHandler)
        }

    })
}

const updateSubBtn = document.querySelector('.update-subscription-btn')
if (updateSubBtn) {
    updateSubBtn.addEventListener('click', async (e) => {
        const { subscription, products } = await (await fetch('/api/updateSubscriptionTool', { method: 'post' })).json()
        document.querySelector('.subscription-section').outerHTML =
            `
                    <div class="subscription-section">
                        <h2>Статус: <span class="subscription-status">Активен</span></h2>
                        <div class="subscription-details">
                            <span class="subscription-name">${subscription.title}</span>
                            <span class="subscription-end">До окончания: ${subscription.timeToLive} дней</span>
                        </div>
    
                        <div class="products-section">
                            ${products.reduce((acc, el) => acc +=
                `<div class="product-item">
                                    <span>${el.name} - ${el.quantity} шт.</span>
                                    <button type="button" id="product${el.id}" class="btn deduct-btn">Списать</button>
                                </div>`, '')}
                        </div>
                    </div>
                    `
        const deductBtns = document.querySelectorAll('.deduct-btn')
        for (let btn of deductBtns) {
            btn.addEventListener('click', deductButtonHandler)
        }
    })
}

// const lockBtn = document.querySelector('.lock-btn')
// lockBtn.addEventListener('click', async (e) => {
//     await fetch('/api/lockClientTool', { method: 'POST', })
//     location.reload()
// })

const deductBtns = document.querySelectorAll('.deduct-btn')

if (deductBtns.length) {
    for (let btn of deductBtns) {

        btn.addEventListener('click', deductButtonHandler)
    }
}

async function deductButtonHandler(e) {


    const popUp = document.querySelector('.popup-overlay')
    popUp.addEventListener('click', popUpCloseHandler)

    const resendCodeButton = document.getElementById('resend-code')
    resendCodeButton.addEventListener('click', resendButtonHandler)

    const confirmCodeButton = document.getElementById('confirm-code')
    confirmCodeButton.addEventListener('click', confirmButtonHandler)



    e.preventDefault()


    popUp.classList.add('active')
    const productId = e.target.id.replace(/[^0-9]/g, '')
    await fetch('/api/updateDeductCode', {
        method: 'POST',
        body: JSON.stringify({ productId }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
}


async function confirmButtonHandler(e) {
    e.preventDefault()
    const inCodeField = document.getElementById('verification-code')
    const inCode = inCodeField.value

    const { isSuccess, productId } = await (await fetch('/api/confirmDeductCode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inCode })
    })).json()

    if (!isSuccess) {
        const errorPlace = document.querySelector('.button-group')
        if (errorPlace.children[0].className === 'btn') {
            errorPlace.insertAdjacentHTML('afterbegin', '<p style="color:#f00">Неверный код!</p>')
        }
    }
    else {
        const deductBtn = document.querySelector(`.products-section #product${productId} `)

        const history = document.querySelector('.operations-history')
        const popUp = document.querySelector('.popup-overlay')
        popUp.classList.remove('active')

        const { name, quantity, operation } = await (await fetch('/api/deleteOneProduct', { method: 'POST' })).json()





        deductBtn.previousElementSibling.innerHTML = `${name} - ${quantity} шт.`
        if (history) {
            history.insertAdjacentHTML('beforeend',
                `
            <div class="operation-item">
                <span>Дата: ${operation.createdAt}</span>
                <span>Товар: ${operation.ProductToSell.name}</span>
                <span>Сотрудник: ${operation.Worker.firstName} ${operation.Worker.lastName}</span>
            </div>
            `)
        }
        else {
            const mainContainer = document.querySelector('.client-profile-container')
            mainContainer.insertAdjacentHTML('beforeend',
                `
            <div class="operations-history">
                <h2>История операций</h2>
                <div class="operation-item">
                    <span>Дата: ${operation.createdAt}</span>
                    <span>Товар: ${operation.ProductToSell.name}</span>
                    <span>Сотрудник: ${operation.Worker.firstName} ${operation.Worker.lastName}</span>
                </div>
            </div>
            `)
        }
        if (quantity < 1) {
            deductBtn.previousElementSibling.parentElement.outerHTML = ''
        }
    }
    inCodeField.value = '';
}

async function popUpCloseHandler(e) {
    const popUp = document.querySelector('.popup-overlay')
    if (!e.target.closest('.popup-content')) {
        popUp.classList.remove('active')
    }
}

async function resendButtonHandler(e) {
    await fetch('/api/updateDeductCode', { method: 'POST' })
}


