const mongoose = require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listings.js")

main().then((res)=>{console.log("connection successful")}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/GO-WANDER');
};

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"6933bc79a35fd77a2100c1a2"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized")
};

initDB();