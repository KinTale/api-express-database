const express = require('express')
const booksRouter = express.Router()
const db = require('../utils/database')

booksRouter.get('/', (req, res) => {
    db.query(' SELECT * FROM books')
        .then(dbResult => {
            res.json({ books: dbResult.rows })
        })
        .catch(e => {
            res.status(500)
            res.json({ error: 'database error' })

            console.log(e)
        })
})

booksRouter.get('/:id', (req, res) => {

    db.query("SELECT * FROM books WHERE id = $1", [req.params.id])
        .then(dbResult => {
            if (dbResult.rowCount === 0) {
                res.status(404)
                res.json({ error: 'book does not exist' })
            } else {
                res.json({ books: dbResult.rows[0] })
            }
        })
        .catch(e => {
            res.status(500)
            res.json({ error: 'database error' })

            console.log(e)
        })
})

booksRouter.post('/', (req, res) => {

    const insertBookSQL = `
    INSERT INTO books(
      title, 
      type, 
      author,
      topic, 
      publicationDate, 
      pages)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`

    const bookValues = [
        req.body.title, //$1
        req.body.type,//$2
        req.body.author, //$3
        req.body.topic,//$4
        req.body.publicationDate,//$5
        req.body.pages //$6
    ]
    console.log(req.body)
    console.log(bookValues)
    db.query(insertBookSQL, bookValues)
        .then(databaseResult => {
            console.log(databaseResult)
            res.json({ book: databaseResult.rows[0] })
        })
        .catch(error => {
            console.log(error)
            res.status(500)
            res.json({ error: 'unexpected error' })
        })
})

module.exports = booksRouter