const express = require('express')
const booksRouter = express.Router()
const db = require('../utils/database')

booksRouter.get('/', (req, res) => {

    let selectBookSQL = ' SELECT * FROM books'
    const selectValues = []
    const queries = []

    if (req.query.type) {
        queries.push({ col: 'type', val: req.query.type })
    }

    if (req.query.topic) {
        queries.push({ col: 'topic', val: req.query.topic })
    }
    if (queries.length > 0) {
        let whereClauses = []
        queries.forEach((query, index) => {
            whereClauses.push(`${query.col} = $${index + 1}`)
            selectValues.push(query.val)
        })
        selectBookSQL += ' WHERE ' + whereClauses.join(' AND ')
    }
    console.log(selectValues)
  console.log(selectBookSQL)
    db.query(selectBookSQL, selectValues)
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



booksRouter.put('/:bookId', (req, res) => {
    const updateBookSQL = `
    UPDATE books SET 
      title = $1,
      type = $2,
      author = $3,
      topic = $4,
      publicationDate = $5,
      pages = $6
    WHERE id = $7
    RETURNING *`

    const updateValues = [
        req.body.title, //$1 = title
        req.body.type, //$2 = type
        req.body.author, //$3 = author
        req.body.topic, //$4 = topic
        req.body.publicationDate, //$5 = publicationDate
        req.body.pages, //$6 = pages
        req.params.bookId, //$7 = bookId
    ]

    db.query(updateBookSQL, updateValues)
        .then(databaseResult => {
            console.log(databaseResult)
            if (databaseResult.rowCount === 0) {
                res.status(404)
                res.json({ error: 'book does not exist' })
            }
            else {
                res.json({ book: databaseResult.rows[0] })
            }
        })
        .catch(e => {
            console.log(e)
            res.status(500)
            res.json({ error: 'unexpected error' })
        })


})




booksRouter.delete('/:id', (req, res) => {
    const deletebookSQL = `DELETE FROM books WHERE id = $1 RETURNING *`

    const deleteId = [req.params.id]
    db.query(deletebookSQL, deleteId)
        .then(dbResult => {
            if (dbResult.rowCount === 0) {
                res.status(404)
                res.json({ error: 'book does not exist' })
            }
            else { res.json({ book: dbResult.rows[0] }) }
        })
        .catch(error => {
            res.status(500)
            res.json({ error: 'unexpected error' })
        })
})


module.exports = booksRouter