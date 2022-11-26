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
 const ProductCollection=client.db('Swap-World').collection("Products");
 app.post('/user', async (req, res) => {
    const user = req.body;
    const email=user.email;
    const query = { email }
    const userinfo = await UserCollection.findOne(query);
    if(userinfo===null)
    {
        const result = await UserCollection.insertOne(user);
        res.send(result);
    }
    else
    {
        res.send(userinfo)
    }
   
    
});
app.get('/user/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email }
    const user = await UserCollection.findOne(query);
    res.send(user);
})
app.get('/users', async (req, res) => {
    const role=req.query.role;
    const query = { role }
    const user = await UserCollection.find(query).sort({_id:-1}).toArray();
    res.send(user);
})
app.put('/usersstate/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) }
    const filtertwo = { sellerid: id }
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            states: 'verified'
        }
    }
    const updatedDoctwo = {
        $set: {
            sellerstates: 'verified'
        }
    }
    const resulttwo = await ProductCollection.updateMany(filtertwo, updatedDoctwo,options);
    const result = await UserCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
});
app.put('/makeadmin/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const updatedDoc = {
        $set:{
            role:"Admin"
        }
    }
    const result = await UserCollection.updateOne(query, updatedDoc);
    res.send(result);
});
app.delete('/userdelete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const querytwo = { sellerid: id };

    const result = await UserCollection.deleteOne(query);
    const resulttwo = await ProductCollection.deleteMany(querytwo);

    res.send(result);
})
app.get('/Category', async (req, res) => {
    
    const query = { }
    const Category = await CategoryCollection.find(query).toArray();
    res.send(Category);
})
app.post('/product', async (req, res) => {
    const product = req.body;
    const result = await ProductCollection.insertOne(product);
    res.send(result);
});
app.get('/productall', async (req, res) => {
    const selleremail=req.query.email;
    let query;
    if(selleremail!=="")
    {
        query = { selleremail}
        const product = await ProductCollection.find(query).sort({_id:-1}).toArray();
         res.send(product);
    }
    else
    {
        query = { }
        const product = await ProductCollection.find(query).sort({_id:-1}).toArray();
        res.send(product);
    }
   
})
app.get('/productallshow/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const querytwo = { category: id };
    const Category = await CategoryCollection.findOne(query);
    const Product = await ProductCollection.find(querytwo).sort({_id:-1}).toArray();
    res.send({Category,Product});
})
app.delete('/productdelete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await ProductCollection.deleteOne(query);
    res.send(result);
})
app.put('/productadvertise/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const options = { upsert: true };
    const updatedDoc = {
        $set:{
            status:"advertised"
        }
    }
    const result = await  ProductCollection.updateOne(query, updatedDoc,options);
    res.send(result);
});
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