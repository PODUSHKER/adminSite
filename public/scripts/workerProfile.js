const editProfileForm = document.querySelector('.employee-profile-form')
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(editProfileForm);
    await fetch(`/api/updateWorkerTool/${workerId}`, {
        method: 'POST',
        body: formData,
    })
    location.reload()
})


const editPasswordForm = document.querySelector('.password-change-form')
editPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(editPasswordForm);

    if (formData.get('password') === formData.get('passwordConfirm')) {
        await fetch('/api/updateWorkerPasswordTool/{{worker.id}}', {
            method: 'POST',
            body: formData,
        })
        if (editPasswordForm.firstElementChild.tagName === 'P') {
            editPasswordForm.firstElementChild.outerHTML = '<p style="color:#0f0">Пароль успешно изменён!</p>'
        }
        else {
            editPasswordForm.insertAdjacentHTML('afterbegin', '<p style="color:#0f0">Пароль успешно изменён!</p>')

        }
    }
    else {

        if (editPasswordForm.firstElementChild.tagName === 'P') {
            editPasswordForm.firstElementChild.outerHTML = '<p style="color:#f00">Пароли не совпадают!</p>'
        }
        else {
            editPasswordForm.insertAdjacentHTML('afterbegin', '<p style="color:#f00">Пароли не совпадают!</p>')
        }
    }
})


const firedButton = document.querySelector('.fire-button')
if (firedButton) {
    firedButton.addEventListener('click', async (e) => {
        await fetch(`/api/blockWorkerTool/${e.target.id}`, {
            method: 'POST'
        })
        location.reload()
    })
}


const unlockButton = document.querySelector('.unlock-button')
if (unlockButton) {
    unlockButton.addEventListener('click', async (e) => {
        await fetch(`/api/unlockWorkerTool/${e.target.id}`, {
            method: 'POST'
        })
        location.reload()
    })
}