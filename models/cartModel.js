import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;
const Cart = mongoose.model(
	"Cart",
	new mongoose.Schema({
        user: {
            type: ObjectId,
            ref: "User",
        },
        product: {
            type: ObjectId,
            ref: "Product",
        },
        quantity:{
            type:Number,
            required:true
        }
        
		
	},{timestamps:true})
);

export default  Cart ;