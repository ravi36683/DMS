import mongoose from 'mongoose';

export const mongoConnect = async () => {
    try {
        await mongoose.connect('mongodb://dms_db:dms_121@localhost:27017')
    }
    catch (e) {
        console.log(`Error connecting to mongo database ${e}`)
    }
}