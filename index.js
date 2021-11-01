const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6jam.mongodb.net/travel_agency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        await client.connect();
        const database = client.db("travel_agency");
        const packageCollection = database.collection("packages");
        const orderCollection = database.collection("orders");

        // GET API
        app.get('/services', async (req, res) => {
            const cursor = packageCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('hitting find', id)
            const query = { _id: ObjectId(id) };
            const result = await packageCollection.findOne(query);
            console.log(result)
            res.send(result);
        })

        // POST API
        app.post('/orders', async (req, res) => {
            const order = req.body.data;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
        app.post('/addService', async (req, res) => {
            const service = req.body.data;
            console.log('hitting post', service)
            const result = await packageCollection.insertOne(service);
            res.json(result);
        })
        app.post('/orders/byid', async (req, res) => {
            const orders = req.body.storeOrder;
            const ids = orders.map(od => ObjectId(od));
            const query = { _id: { $in: ids } };
            const result = await packageCollection.find(query).toArray();
            res.json(result);
        })
        // DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('hitting delete', id);
            console.log(result);
            res.json(result);
        })

        // UPDATE API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const order = req.body.updatedOrder;
            console.log('hitting update', req.body, id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: order.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            console.log(result)
            res.json(result);
        })
    }
    finally {
        // await clinet.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Travel agency node server is running');
})

app.listen(port, () => {
    console.log('listening to port: ', port);
})