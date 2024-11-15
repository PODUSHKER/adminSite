
const searchForm = document.querySelector('.phone-search-form')
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const phone = new FormData(e.srcElement).get('phone')
    const response = await (await fetch('/api/findClientTool', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phone })
    })).json()
    const formContainer = document.querySelector('.find-phone-container')
    if (response.success) {
        formContainer.innerHTML = response.html
        const resendCodeButton = document.querySelector('.sms-btn')
        const confirmCodeButton = document.querySelector('.reg-btn')
        resendCodeButton.addEventListener('click', resendHandler)
        confirmCodeButton.addEventListener('click', confirmCodeHandler)

    }
    else {
        if (formContainer.children[0].tagName !== 'P') {
            formContainer.insertAdjacentHTML('afterbegin', '<p style="color:#f00">Клиент не найден!</p>')
        }
    }
})

async function resendHandler(e) {
    const response = await (await fetch('/api/resendCodeTool', { method: 'post', })).json()
    document.getElementById('secretCode').innerHTML = response['code'];
}

async function confirmCodeHandler(e) {
    const inCode = document.getElementById('smsCode')
    console.log('response start', inCode)
    const rawResponse = await fetch('/api/confirmCodeTool', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: inCode.value })
    })
    if (!rawResponse.redirected) {
        console.log(rawResponse)
        console.log('im here')
        const response = await rawResponse.json()
        document.getElementById('attemptCount').innerHTML = response['attemps']
    }
    else {
        location.href = rawResponse.url
    }
}
