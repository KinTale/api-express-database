const express = require('express')
const petsRouter = express.Router()
const db = require('../utils/database')

petsRouter.get('/', (req, res) => {
    db.query('SELECT * FROM pets')
        .then(dbResult => { res.json({ pets: dbResult.rows }) })
        .catch(e => {
            res.status(500)
            res.json({ error: 'database error' })
        })

})

petsRouter.get('/:id', (req, res) => {
    db.query('SELECT * FROM pets WHERE id = $1', [req.params.id])
        .then(dbResult => {
            if (dbResult.rowCount === 0) {
                res.status(404)
                res.json({ error: 'Pet doesnt exist' })
            } else { res.json({ pets: dbResult.rows }) }
        })
        .catch(e => {
            res.status(500)
            res.json({ error: 'database error' })
        })

})

petsRouter.post('/', (req,res) => {
    const insertPetSQL = `
    INSERT INTO pets (
        name,
        age, 
        type, 
        breed, 
        microchip) 
        VALUES($1, $2, $3, $4, $5)
        RETURNING *`

        const petValues = [
            req.body.name,
            req.body.age,
            req.body.type,
            req.body.breed,
            req.body.microchip
        ]

        db.query(insertPetSQL, petValues)
        .then(dbResult => {
            res.json({pet: dbResult.rows[0]})
        })
        .catch(e => {
            res.status(500)
            res.json({ error : 'unxpected error'})
        })

})



module.exports = petsRouter