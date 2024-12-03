const addProductBtn = document.querySelector('.add-product-btn')
const popup = document.querySelector('.popup')
const popupCloseBtn = document.querySelector('.close-btn')

addProductBtn.addEventListener('click', (e) => {
    popup.style.display = 'flex'
})


popupCloseBtn.addEventListener('click', (e) => {
    popup.style.display = 'none'
})


const productForm = document.getElementById('product-form')
productForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const productName = document.getElementById('product-name')
    const productQuantity = document.getElementById('product-quantity')
    const errorMsg = document.getElementById('errorMsg')
    if (errorMsg) errorMsg.outerHTML = '';

    if (productName.value && productQuantity.value) {
        const formDate = new FormData(e.target)
        const { product } = await (await fetch('/api/createProductTool', { method: 'POST', body: formDate })).json()
        const productList = document.getElementById('product-list')
        productList.insertAdjacentHTML('beforeend', `
                <div class="product-item" id="${product.id}">
                    <span><strong>Продукт:</strong> ${product.name}</span>
                    <span><strong>Количество:</strong> ${product.quantity}</span>
                    <button class="delete-btn">×</button>
                </div>
        `)



        productList.lastElementChild.lastElementChild.addEventListener('click', deleteParentButtonHandler)
        productName.value = '';
        productQuantity.value = '';
        popup.style.display = 'none';

    }
    else {
        document.querySelector('.create-btn').outerHTML = `
            <p style="color:#f00;margin:0" id="errorMsg">Необходимо заполнить все поля!</p>
            <button type="submit" class="create-btn">Добавить</button>
            `
    }
})


const deleteProductButtons = document.querySelectorAll('.delete-btn')

for (let button of deleteProductButtons) {

    button.addEventListener('click', deleteParentButtonHandler)
}


async function deleteParentButtonHandler(e) {
    e.preventDefault()

    const productId = e.target.parentElement.id


    await fetch(`/api/deleteProduct/${productId}`, { method: 'POST' })
    e.target.parentElement.outerHTML = '';
}