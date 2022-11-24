const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port=process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jpoqt1r.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
try{
 const UserCollection=client.db('Swap-World').collection("User");
 const CategoryCollection=client.db('Swap-World').collection("Category");
 app.post('/user', async (req, res) => {
    const user = req.body;
    console.log(user);
    const result = await UserCollection.insertOne(user);
    res.send(result);
});
app.get('/user/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email }
    const user = await UserCollection.findOne(query);
    res.send(user);
})
app.get('/users', async (req, res) => {
    const query = {  }
    const user = await UserCollection.find(query).sort({_id:-1}).toArray();
    res.send(user);
})
app.put('/usersstate/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) }
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            states: 'verified'
        }
    }
    const result = await UserCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
});
app.get('/Category', async (req, res) => {
    
    const query = { }
    const Category = await CategoryCollection.find(query).sort({_id:-1}).toArray();
    res.send(Category);
})


}
finally
{

}
}
run();

app.get('/',(req,res)=>{
    res.send("new website ")
});
app.listen(port, () =>
{
    console.log(`Listening to port ${port}`);
})