import mongoose from "mongoose";


const { ObjectId } = mongoose.Schema.Types;
const StoreModel = new mongoose.Schema({
		sellerName: {
			type: ObjectId,
			ref: "User",
		},
		storeName: {
			type: String,
			min: 5,
			maxlength: 100,
			required: true,
		},
		storeAddress: {
			type: String,
			min: 5,
			maxlength: 100,
			validate: /^[a-zA-Z0-9,. ]*$/,
			required: true,
		},
		storeDescription: {
			type: String,
			min: 5,
			maxlength: 255,
			validate: /^[a-zA-Z0-9,. ]*$/,
			required: true,
		},
		storeType: {
			type: String,
			min: 5,
			maxlength: 100,
			required: true,
		},
		contactNumber: {
			type: Number,
			required: true,
		},
		socialMediaAcc: {
			type: String,
			min: 5,
			maxlength: 225,
			required: true,
		},
		createdAt: {
			type: Date,
			default:new Date()
		},
	   storeBackgroundImage:{
		type: String,
		default:"https://res.cloudinary.com/kaking/image/upload/v1604108250/xyjvdcouhpdgau0hcfgn.png"
	   },
	   storeImages:{
		type: Array,
		default: []
	},
	})
	StoreModel.index({storeName:'text'})

const Store=mongoose.model('Store',StoreModel)
export default Store 