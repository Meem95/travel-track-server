const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

//travelAgency
//AKo34ufNo4ab4HO3

console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52gi70p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const travelCollection = client.db('travelDB').collection('location');
    const countryCollection = client.db('travelDB').collection('countries');
    //country get route
    app.get('/country', async (req, res) => {
        const cursor = countryCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    //tourist spot get route
    app.get('/location', async (req, res) => {
        const cursor = travelCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    //post route
    app.post('/location', async (req, res) => {
        const newLocation = req.body;
        console.log(newLocation);
        const result = await travelCollection.insertOne(newLocation);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Travel Agency server is running')
})

app.listen(port, () => {
    console.log(`Travel Agency Server is running on port: ${port}`)
})