const fs = require('fs')
const path = require('path')
const multer = require('multer')

const uploadDir = path.join(__dirname, '..', '/uploads/Profile-Pic')

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/
    const isValid = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
    )
    if (isValid) {
        cb(null, true)
    } else {
        cb(new Error('Only .jpeg, .jpg and .png files are allowed'))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
})

// Delete image function

const deleteImage = (filename, folder = 'Profile-Pic') => {
    if (!filename) return

    const filePath = path.join(__dirname, '..', 'uploads', folder, filename)

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Failed to delete uploaded file:', err)
        } else {
            console.log(`Deleted file: ${filePath}`)
        }
    })
}

module.exports = { deleteImage, upload }
