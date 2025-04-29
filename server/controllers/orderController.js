import User from "../models/User.js"
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from 'stripe';


// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const {userId, items, address} = req.body;
 
        if(!address || items.length===0){
            return res.json({success:false, message: "Invalid Data"})
        }
        // calculate amount using items
        let amount =await items.reduce(async(acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        },0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        })

        return res.json({success:true, message: "Order Placed Successfully"})
    } catch (error) {
        return res.json({success:false, message: error.message})
    }
}

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        if (!address || items.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid Data" });
        }

        let productData = [];
        let amount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
            amount += product.offerPrice * item.quantity;
        }

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = productData.map(item => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.name },
                unit_amount: Math.floor(item.price) * 100
            },
            quantity: item.quantity,
        }));

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        });
        return res.json({ success: true, url: session.url });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Stripe webhooks to verify payments action : /stripe
export const stripeWebHooks = async (request, response)=>{
    console.log("inside stripewebhooks")
    // stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOKS_SECRET
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event 
    switch(event.type){
        case "payment_intent.succeeded" : {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId, userId} = session.data[0].metadata;

            // mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true})
            // clear user cart
            await User.findByIdAndUpdate(userId, {cartItems:{}})
            break;
        }
        case "payment_intent.payment_failed" : {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id

            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId} = session.data[0].metadata;

            // delete the order because payment not successfull
            await Order.findByIdAndDelete(orderId)
            break;

        }

        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({received: true})
}

// Get orders by User id : /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const  userId  = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: 'COD'}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1})
        res.json({success: true, orders});
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Get All orders (for seller/admin): /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: 'COD'}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1})
        res.json({success: true, orders});
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}