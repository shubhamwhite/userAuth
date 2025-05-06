require('dotenv').config() // Load env vars early

const config = {
    get: (key) => {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable: ${key}`)
        }
        return process.env[key]
    },
}

module.exports = config
