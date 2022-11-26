const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port=process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jpoqt1r.mongodb.net/?retryWrites=true&w=majority`;

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}


const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
try{
 const UserCollection=client.db('Swap-World').collection("User");
 const CategoryCollection=client.db('Swap-World').collection("Category");
 const ProductCollection=client.db('Swap-World').collection("Products");
 const OrderCollection=client.db('Swap-World').collection("Orders");



 const verifyAdmin = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await UserCollection.findOne(query);

    if (user?.role !== 'Admin') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next();
}


 const verifySeller = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await UserCollection.findOne(query);

    if (user?.role !== 'Seller') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next();
}
const verifyadminSeller = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await UserCollection.findOne(query);

    if (user?.role !== 'Seller'||user?.role !== 'Admin') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next();
}


app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await UserCollection.findOne(query);
    if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
        return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: '' })
});


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
app.get('/users',verifyJWT,verifyAdmin, async (req, res) => {
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
app.get('/productall',verifyJWT, async (req, res) => {
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
app.get('/advertiseproduct', async (req, res) => {
    let query;
  
     query = {status:"advertised" }
     const product = await ProductCollection.find(query).sort({_id:-1}).toArray();
     res.send(product);
    
   
})
app.get('/productallshow/:id',verifyJWT, async (req, res) => {
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
app.post('/order', async (req, res) => {
    const order = req.body;
    const id=order.p_id;
    const query = { _id: ObjectId(id) }
    const options = { upsert: true };
    const updatedDoc = {
        $set:{
            status:"Booking"
        }
    }
    const resulttwo = await  ProductCollection.updateOne(query, updatedDoc,options);
    const result = await OrderCollection.insertOne(order);
    res.send(result);
});
app.get('/ordertall', async (req, res) => {
    const orderemail=req.query.email;
    const ordertype=req.query.type;
    console.log(ordertype,orderemail)
    let query;
    if(ordertype==="Admin")
    {
        query = {}
        const product = await OrderCollection.find(query).sort({_id:-1}).toArray();
         res.send(product);
    }
    else if(ordertype==="Buyer")
    {
        query = {email:orderemail}
        const product = await OrderCollection.find(query).sort({_id:-1}).toArray();
        res.send(product);
    }
    else if(ordertype==="Seller")
    {
        query = {seller:orderemail}
        const product = await OrderCollection.find(query).sort({_id:-1}).toArray();
        res.send(product);
    }
   
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