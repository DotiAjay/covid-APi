const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'covid19India.db')
const app = express()
app.use(express.json())
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

// get
app.get('/states/', async (request, response) => {
  const stateQuery = ` 
    select * from state;
    `
  const getState = await db.all(stateQuery)
  response.send('hello')
})
// get a state
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const stateGetQuery = `  
 select * from state where 
 state_id =${stateId};
`
  const getstate2 = await db.get(stateGetQuery)
  response.send(getstate2)
})

// post district
app.post('/districts/', async (request, response) => {
  const value = response.body
  const {districtName, stateId, cases, cured, active, deaths} = {value}
  const postQuery = `  
  Insert INTO district (district_name, state_id, cases, cured, active,deaths)
  values{
  ${districtName},
  ${stateId},
  ${cured},
  ${active},
  ${deaths}

  };`
  const queryVal = await db.run(postQuery)
  response.send('District Successfully Added')
})
// get district
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtGetQuery = `  
 select * from district where 
 district_id =${districtId};
`
  const getdistrict = await db.get(districtGetQuery)
  response.send(getdistrict)
})
// delete district
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deletDisQuery = ` 
  delete from district where
  district_id = ${districtId};
  `
  const deleteRes = await db.run(deletDisQuery)
  response.send('District Removed')
})
// put  district
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const putQuery = ` 
  update district  set  
district_name = '${districtName}',
state-id= ${stateId},
cases =${cases},
cured =${cured},
active =${active},
deaths=${deaths}
where  district_id = ${districtId};

`
  const putRes = await db.run(putQuery)
  response.send('District Details Updated')
})
// get API 7
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const dbQuery = ` 
  select sum(cases),
  sum(cured),sum(active),sum(deaths) 
  from district 
  where 
  state_id = ${stateId};
 `
  const stats = await db.get(dbQuery)
  console.log(stats)
  response.send({
    totalCases: stats['sum(cases)'],
    totalCured: stats['sum(cured)'],
    totalActive: stats['sum(active)'],
    totalDeaths: stats['sum(deaths'],
  })
})
// get state name

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const stateNameQuery = `  select state_id from district
    where district_id = ${districtId};`
  const stateId = await db.get(stateNameQuery)
  const Getstate = 'select state_name from state where state_id = ${stateId};'
  const stateNameRes = await db.get(Getstate)
  response.send({
    stateName: 'Getstate[state_name]',
  })
})
module.exports = app
