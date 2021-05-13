import mongoose from "mongoose";


const { ObjectId } = mongoose.Schema.Types;
const Product = mongoose.model(
	"Product",
	new mongoose.Schema({
		storeName: {
			type: ObjectId,
			ref: "Store",
		},
		storeOwner: {
			type: ObjectId,
			ref: "User",
		},
		productName: {
			type: String,
			min: 5,
			maxlength: 100,
			required: true,
		},
		Rating: {
			type: String,
			min: 5,
			maxlength: 255,
			validate: /^[a-zA-Z0-9,. ]*$/,
		},
		price: {
			type: Number,
			default: 0,
			required: true,
		},
		productStocks: {
			type: Number,
			default: 0,
			required: true,
		},
		sold: {
			type: Number,
			default: 0,
		},
		image: {
			type: String,
			default: "https://res.cloudinary.com/kaking/image/upload/v1604108250/xyjvdcouhpdgau0hcfgn.png",
		},
		description:{
			type: String,
			min: 5,
			maxlength: 255,
		
		},
		createdAt:{
			type: Date,
			default:new Date()
		}
	})
);

export default Product 