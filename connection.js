require('dotenv').config();
const { MongoClient } = require('mongodb');

function main() {
    const URI = process.env.MONGO_URI; 
    const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        client.connect();
      
        return client
    } catch (e) {
        // Catch any errors
        console.error(e);
        throw new Error('Unable to Connect to Database')
    }
}

module.exports = main;