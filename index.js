const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require("dotenv").config()

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Assignment 10 is running')
})

app.listen(port, () => {
  console.log(`Assignment 10 is running on port ${port}`);
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h1i8cb8.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const productCollection = client.db("productDB").collection("product")
    const productBrand = client.db("productBrandDB").collection("brand")
    const productCart = client.db("productCart").collection("cart")

    // Get the data from client server of brand name
    app.post('/brands', async (req, res) => {
      const newBrand = req.body
      console.log(newBrand);
      const result = await productBrand.insertOne(newBrand)
      console.log(result);
      res.send(result)
    })

    // send data to client of brand name
    app.get('/brands', async (req, res) => {
      const cursor = productBrand.find()
      const result = await cursor.toArray()
      res.send(result)
    })

     // Get the data from client server
     app.post('/products', async (req, res) => {
      const newProduct = req.body
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct)
      console.log(result);
      res.send(result)
    })

    // send data to client
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // send data to client for product single id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await productCollection.findOne(query);
      console.log(result);
      res.send(result);
    });


    // Get the data from client server of cart product
    app.post('/cart', async (req, res) => {
      const newCart = req.body
      console.log(newCart);
      const result = await productCart.insertOne(newCart)
      console.log(result);
      res.send(result)
    })

    // send data to client of cart product 
    app.get('/cart', async (req, res) => {
      const cursor = productCart.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // update product operation
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          name: data.name,
          brand: data.brand,
          price: data.price,
          description: data.description,
          rating: data.rating,
          photo: data.photo,
          type: data.type
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedProduct,
        options
      );
      res.send(result);
    });

// delete from cart

app.delete("/cart/:id", async (req, res) => {
  const id = req.params.id;
  console.log( id);
  const query = {
    _id: (id),
  };
  const result = await productCart.deleteOne(query);
  console.log(result);
  res.send(result);
});
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
