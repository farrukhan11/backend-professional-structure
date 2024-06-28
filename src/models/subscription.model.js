import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subcriber: {
        type: Schema.Types.ObjectId, // Ther person subscribing
        ref: 'User',
        type: String,
        required: true
    }
    ,
    channel: {
        type: Schema.Types.ObjectId, // The person being subscribed to
        ref: 'User',
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
    ,

},
    {
        timestamps: true

    }
)

export const Subscription = mongoose.model('Subscription', subscriptionSchema)