const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const {sequelize} = require('./utils/dbSettings.js')
const hbsConfig = require('./utils/hbsConfig.js')
const hbs = require('hbs')
const app = express()
const mainRouter = require('./routes/mainRoutes.js')
const apiToolRouter = require('./routes/apiToolRoutes.js')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const isAuthenticate = require('./utils/isAuthenticate.js')
const allowUrlsValidation = require('./utils/allowUrlsValidation.js')
const initCookieParams = require('./utils/initCookieParams.js')


const staticPath = path.join(__dirname, 'public')
const templatesPath = path.join(__dirname, 'templates')

console.log(templatesPath)


app.use(express.static(staticPath))
dotenv.config()
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())
app.use(multer({dest: path.join(staticPath, 'img')}).single('image'))

app.set('view engine', 'hbs')
app.set('views', templatesPath)
app.engine('hbs', hbsConfig)


async function init(){
    try{

        await sequelize.sync()
        app.listen(3000, () => console.log('server started'))
        main()
    }
    catch(err){
        console.log(err)
    }
}


async function main(){

    app.use(isAuthenticate)
    app.use(allowUrlsValidation)
    app.use(initCookieParams)
    
    app.use('', mainRouter)
    app.use('/api', apiToolRouter)


}

init()

process.on('SIGINT', async () => {
    await sequelize.close()
    process.exit()
})

process.on('uncaughtException', async (err) => {
    console.log(err)
})