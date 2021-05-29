import express from "express";
import ASYNC from 'async'

import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js'
import paymentModel from '../models/paymentModel.js';
import {getUser} from '../server.js'

const router = express.Router();


router.post('/successBuy',async(req,res)=>{
	let history=[]
	let transactionData={}
    const me = await getUser(req);
	req.body.cartDetail.forEach((item)=>{
		history.push({
			dateOfPurchase:new Date(),
			name:item.productName,
			id: item.id,
			price: item.price,
			image:item.image,
			quantity: item.quantity,
			storeName:item.storeName,
			storeOwner:item.storeOwner,
			paymentId: req.body.paymentData.paymentID,
			buyer:{id:me.id,email:me.email}
		})
	})

	transactionData.data=req.body.paymentData;
	transactionData.product=history;
	 
	userModel.findOneAndUpdate(
        { _id: me.id },
        { $push: { history: history }, $set: { cart: [] } },
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err });
            const payment = new paymentModel(transactionData)
            payment.save((err, doc) => {
				if (err) return res.json({ success: false, err });
				
				let products = [];
                doc.product.forEach(item => {
                    products.push({ id: item.id, quantity: item.quantity })
                })

                ASYNC.eachSeries(products, (item, callback) => {
                    productModel.updateMany(
                        { _id: item.id },
                        {
                            $inc: {
                                "sold":item.quantity
                            }
                        },
                        { new: false },
                        callback
                    )
                }, (err) => {
                    if (err) return res.json({ success: false, err })
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                })

            })
        }
    )
})

export default router;