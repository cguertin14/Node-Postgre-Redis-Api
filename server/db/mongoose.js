import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/<NAME_HERE>', { useNewUrlParser: true });

export default { mongoose };