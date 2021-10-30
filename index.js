const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8tdq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("Online_Shop");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    //GET Product  API
    app.get("/products", async (req, res) => {
      console.log(req.query);
      const cursor = productsCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await cursor.count();
      let products;
      if (page) {
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        const products = await cursor.toArray();
      }
      //const products = await cursor.limit(4).toArray();
      // console.log(products);

      
      // res.send(products);
      res.send({
        count,
        products,
      });
    });

    //USE POST to get DATA by KEYS 
    app.post('/products/byKeys', async(req,res)=>{
        console.log(req.query);
        const keys = req.body;
        const query = {key: {$in: keys}};
        const products = await productsCollection.find(query).toArray();
        res.json(products);
        res.send('hitting post');
    })

    //Add Orders API
    app.post('/orders',async(req,res)=>{
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        console.log('order',order);
        res.json(result);
    })
    //console.log('DB connected successfully');
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ema John server is running...");
});

app.listen(port, () => {
  console.log("Server running at port:", port);
});
