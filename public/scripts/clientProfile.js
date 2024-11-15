const seconds = Number(document.querySelector('.timeout-seconds').getAttribute('value'))
console.log(seconds)
setTimeout(async () => {
    await fetch('/deleteTempData', {method: 'POST'})
    location.href = '/'
}, seconds*1000);

const subBtn = document.querySelector('.subscription-btn')
if (subBtn) {
    subBtn.addEventListener('click', async (e) => {
        const { subscription, cofe, cola } = await (await fetch('/api/createSubscriptionTool', { method: 'POST' })).json()

        subBtn.outerHTML =
            `
                <div class="subscription-section">
                    <h2>Статус: <span class="subscription-status">Активен</span></h2>
                    <div class="subscription-details">
                        <span class="subscription-name">${subscription.title}</span>
                        <span class="subscription-end">До окончания: ${subscription.timeToLive} дней</span>
                    </div>

                    <div class="products-section">
                        <div class="product-item">
                            <span>${cofe.name} - ${cofe.quantity} шт.</span>
                            <button type="button" id="${cofe.id}" class="btn deduct-btn">Списать</button>
                        </div>
                        <div class="product-item">
                            <span>${cola.name} - ${cola.quantity} шт.</span>
                            <button type="button" id="${cola.id}" class="btn deduct-btn">Списать</button>
                        </div>
                    </div>
                </div>
                `
        const deductBtns = document.querySelectorAll('.deduct-btn')
        for (let btn of deductBtns) {
            btn.addEventListener('click', deductButtonHandler)
        }

    })
    console.log(subBtn, 'penis')
}

const lockBtn = document.querySelector('.lock-btn')
lockBtn.addEventListener('click', async (e) => {
    await fetch('/api/lockClientTool', { method: 'POST', })
    location.reload()
})

const deductBtns = document.querySelectorAll('.deduct-btn')
if (deductBtns.length) {
    for (let btn of deductBtns) {
        btn.addEventListener('click', deductButtonHandler)
    }
}

async function confirmButtonHandler(e) {
    e.preventDefault()
    const inCode = document.getElementById('verification-code').value
    console.log('im start first fetch')
    const { isSuccess, productId } = await (await fetch('/api/confirmDeductCode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inCode })
    })).json()
    console.log('im skip one controller')
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
        console.log('im start second controller')
        const { name, quantity, operation } = await (await fetch('/api/deleteOneProduct', { method: 'POST' })).json()
        console.log('name', name)
        console.log('quantity', quantity)
        console.log('operation', operation)
        console.log('im end second controllers')
        console.log(deductBtn.previousElementSibling)
        deductBtn.previousElementSibling.innerHTML = `${name} - ${quantity} шт.`
        if (history) {
            history.insertAdjacentHTML('beforeend',
                `
            <div class="operation-item">
                <span>Дата: ${operation.createdAt}</span>
                <span>Товар: ${operation.Product.name}</span>
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
                    <span>Товар: ${operation.Product.name}</span>
                    <span>Сотрудник: ${operation.Worker.firstName} ${operation.Worker.lastName}</span>
                </div>
            </div>
            `)
        }
        if (quantity < 1) {
            deductBtn.previousElementSibling.parentElement.outerHTML = ''
        }
    }

}

const popUp = document.querySelector('.popup-overlay')

popUp.addEventListener('click', async (e) => {
    if (!e.target.closest('.popup-content')) {
        popUp.classList.remove('active')
    }
})

async function deductButtonHandler(e) {
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

const resendCodeButton = document.getElementById('resend-code')
resendCodeButton.addEventListener('click', async (e) => {
    await fetch('/api/updateDeductCode', { method: 'POST' })
})

const confirmCodeButton = document.getElementById('confirm-code')
confirmCodeButton.addEventListener('click', confirmButtonHandler)


