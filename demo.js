//First we use MongoClient (define what this is exactly) in order to connect to mongodb.//

require('dotenv').config();

const { create } = require('domain');
const { MongoClient, } = require('mongodb');
const { resourceLimits } = require('worker_threads');

//Call functions that create our database, then disconnect from the cluster.//
// Why asyc
async function main() {
    const uri = process.env.MongoURI

    const client = new MongoClient(uri);
    try {
        await client.connect();

        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"))


    } catch (e) {
        console.error(e)
    } finally {
        await client.close();
    }
}

main().catch(console.error);



async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({ "last_scraped": { $lt: date } });

    console.log(`${result.deletedCount} document(s) was/were deleted`);
}
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({ name: nameOfListing });

    console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({ property_type: { $exists: false } },
        { $set: { property_type: "Unknown" } });

    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        { name: nameOfListing }, { $set: updatedListing }, { upsert: true }
    );

    console.log(`${result.matchedCount} document(s) matched the query criteria`);

    if (result.upsertedCount > 0) {

        console.log(`One document was inserted with the id ${result.upsertedId}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        { name: nameOfListing }, { $set: updatedListing }
    );

    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: { $gte: minimumNumberOfBedrooms },
        bathrooms: { $gte: minimumNumberOfBathrooms }
    }).sort({ last_review: -1 }).limit(maximumNumberOfResults);

    const results = await cursor.toArray();

    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(` _id: ${result._id}`);
            console.log(` bedrooms: ${result.bedrooms}`);
            console.log(` bathrooms: ${result.bathrooms}`);
            console.log(` most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

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