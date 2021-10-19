//First we use MongoClient (define what this is exactly) in order to connect to mongodb.//

require('dotenv').config();

const { create } = require('domain');
const { MongoClient, } = require('mongodb');

//Call functions that create our database, then disconnect from the cluster.//
// Why asyc
async function main() {
    const uri = process.env.MongoURI

    const client = new MongoClient(uri);
    try {
        await client.connect();

        await findOneListingByName(client, "Infinite Views");


    } catch (e) {
        console.error(e)
    } finally {
        await client.close();
    }
}

main().catch(console.error);

// async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
//     minimumNumberOfBedrooms = 0,
//     minimumNumberOfBathrooms = 0,
//     maximumNumberOfResultss = Number.MAX_SAFE_INTEGER
// } = {}) {

// }

async function findOneListingByName(client, nameOfListing) {
    //The Query"this database" in "this table".findOne() function we call //
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });

    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}'`);
        console.log(result)
    } else {
        console.log(`No listings with the name '${nameOfListing}'`);
    }

}

async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings)

    console.log(`${result.insertedCount} new listings created with the following id(s):`);
    console.log(result.insertedIds);
}

async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);

}

async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases");
    databasesList.databases.forEach(db => {
        console.log(`-${db.name}`);
    })
}