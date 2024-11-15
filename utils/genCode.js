function genCode(){
    const step = 10;
    const code = Math.random().toString().slice(2+step, 6+step)
    return code
}

module.exports = genCode