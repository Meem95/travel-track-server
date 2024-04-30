const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52gi70p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const travelCollection = client.db("travelDB").collection("location");
    const countryCollection = client.db("travelDB").collection("countries");
    const userCollection = client.db('travelDB').collection('user');
    //country get route
    app.get("/country", async (req, res) => {
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/location-by-country', async (req, res) => {
      try {
        const country = req.query.country;
        const query = {country_Name : country };
        const result = await travelCollection.find(query).toArray();
        res.json(result);
      } catch (error) {
        console.error('Error fetching data by country:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    //tourist spot get route
    app.get("/location", async (req, res) => {
      const cursor = travelCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //post route
    app.post("/location", async (req, res) => {
      const newLocation = req.body;
      console.log(newLocation);
      const result = await travelCollection.insertOne(newLocation);
      res.send(result);
    });

    //my list route
    app.get("/myLocation/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await travelCollection.find({ email: req.params.email }).toArray();
      res.send(result)
    })



    app.get("/location/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.findOne(query);
      res.send(result);
    });
    //update route
    app.put("/location/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedLocation = req.body;

      const location = {
        $set: {
          tourists_spot_name: updatedLocation.tourists_spot_name,
          country_Name: updatedLocation.country_Name,
          average_cost: updatedLocation.average_cost,
          totalVisitorsPerYear: updatedLocation.totalVisitorsPerYear,
          location: updatedLocation.location,
          seasonality: updatedLocation.seasonality,
          image: updatedLocation.image,
          travel_time: updatedLocation.travel_time,
          short_description: updatedLocation.short_description,
        },
      };

      const result = await travelCollection.updateOne(
        filter,
        location,
        options
      );
      res.send(result);
    });
    //delete
    //delete method
    app.delete("/location/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete from database", id);
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.deleteOne(query);
      res.send(result);
    });

    // user related apis
   
    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
  })

  app.post('/user', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
  });

  app.patch('/user', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email }
      const updateDoc = {
          $set: {
              lastLoggedAt: user.lastLoggedAt
          }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
  })

  

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel Agency server is running");
});

app.listen(port, () => {
  console.log(`Travel Agency Server is running on port: ${port}`);
});
