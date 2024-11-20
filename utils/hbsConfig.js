const expressHbs = require('express-handlebars')

const hbsConfig = expressHbs.engine({
    layoutsDir: 'templates/layouts',
    defaultLayout: 'base',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        not(el){
            return !el
        },
        isAdmin(role){
            return role === 'Admin'
        },
        getDaysOver(endDate){
            const result = Math.ceil((endDate - new Date()) / (1000*60*60*24))
            return result
        },
        getPageNumbers(pages){
            const arr = []
            for (let i = 1; i <= pages; i++){
                arr.push(i)
            }
            return arr;
        },
        equals(a, b){

            return Number(a) === Number(b);
        },
        plusOne(a){
            return Number(a) + 1;
        },
        minusOne(a){
            return Number(a) - 1;
        },
        getTime(date){
            return date.toLocaleDateString()
        },
        getMainTime(date){
            return date.toLocaleTimeString().slice(0, -3)
        }
    }
})


module.exports = hbsConfig