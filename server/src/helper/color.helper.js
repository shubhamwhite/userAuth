// helpers/cliColor.js
const clc = require('cli-color')

const cliColor = {
    success: (msg) => console.log(clc.green(msg)),
    error: (msg) => console.log(clc.red(msg)),
    info: (msg) => console.log(clc.cyan(msg)),
    warn: (msg) => console.log(clc.yellow(msg)),
    bold: (msg) => clc.bold(msg), // returns string, doesn't print
}

module.exports = cliColor
