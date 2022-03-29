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

petsRouter.put('/:id', (req, res) => {
const updatePetSQL = `
UPDATE pets SET
name = $1,
age = $2,
type = $3,
breed = $4,
microchip = $5
WHERE id = $6
RETURNING *
`

const petValues = [
    req.body.name,
    req.body.age,
    req.body.type,
    req.body.breed,
    req.body.microchip,
    req.params.id
]
db.query(updatePetSQL, petValues)
.then(dbResult => {
    if(dbResult.rowCount === 0){
        res.status(404)
        res.json({error: 'pet not found'})
    }else {
        res.json({pet: dbResult})
    }
})
.catch(e => {
    res.status(500)
    res.json({error : 'unexpected error'})
})

})


petsRouter.delete('/:id', (req, res) => {
    const deletePetSql = 'DELETE FROM pets WHERE id = $1 RETURNING *'
    const deleteValue = [req.params.id]

    db.query(deletePetSql, deleteValue)
    .then(dbResult => {
        if(dbResult.rowCount === 0){
            res.status(404)
            res.json({ error : 'Pet doesnt exist'})
        } else {
            res.json({pet: dbResult.rows[0]})
        }
    })
    .catch(e => {
        res.status(500)
        res.json({ error : 'unexpected error'})
    })
})

module.exports = petsRouter