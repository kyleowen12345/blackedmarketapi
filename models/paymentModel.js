import mongoose from "mongoose";


const Payment = mongoose.model(
	"Payment",
	new mongoose.Schema({
        data: {
            type: Array,
            default: []
        },
        product: {
            type: Array,
            default: []
        }
		
	},{timestamps:true})
);

export default  Payment ;