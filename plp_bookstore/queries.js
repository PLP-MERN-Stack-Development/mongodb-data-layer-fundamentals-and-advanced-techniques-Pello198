// queries.js
import { MongoClient } from "mongodb";

// MongoDB connection URL and database name
const url = "mongodb://127.0.0.1:27017";
const dbName = "plp_bookstore";

async function runQueries() {
  const client = new MongoClient(url);

  try {
    
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db(dbName);
    const books = db.collection("books");

    const genre = "Fiction"; 
    const booksInGenre = await books.find({ genre }).toArray();
    console.log(`Books in genre "${genre}":`, booksInGenre);

    const year = 2000; 
    const recentBooks = await books.find({ year: { $gt: year } }).toArray();
    console.log(`Books published after "${year}":`, recentBooks);

  
    const author = "George Orwell"; 
    const booksByAuthor = await books.find({ author }).toArray();
    console.log(`Books by "${author}":`, booksByAuthor);


    const titleToUpdate = "1984";
    const updateResult = await books.updateOne(
      { title: titleToUpdate },
      { $set: { price: 24 } }
    );
    console.log(`Updated price of "${titleToUpdate}":`, updateResult);

    
    const titleToDelete = "The Great Gatsby"; 
    const deleteResult = await books.deleteOne({ title: titleToDelete });
    console.log(`Deleted "${titleToDelete}":`, deleteResult);

    const book="wielder of the rings";
    const bookDetails = await books.insertOne({
       title: book ,
       author: "J.R.R. Tolkien",
       genre: "Fantasy",
       year: 1966,
       price: 25
      
      });



      // Advanced Queries
      const query1 = await books.find({in_stock:true},{published_year:{$gt:2010}}).toArray();
      console.log("Books in stock published after 2010:", query1);
      const projection = await books.find({}, { projection: { title: 1, author: 1,price:1, _id: 0 } }).toArray();
      console.log("Titles and authors of all books:", projection);
      const sortedBooks1 = await books.find().sort({ price :1 }).toArray();
      console.log("Books sorted by price (ascending):", sortedBooks1);
      const sortedBooks2 = await books.find().sort({ price :-1 }).toArray();
      console.log("Books sorted by price (descending):", sortedBooks2);
      const page = 2;
      const pageSize = 5;
      const limit= await books.find().skip((page -1)* pageSize).limit(pageSize).toArray();

      // Aggregation Queries
      const avgPricesByGenre = await books.aggregate([
      { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } },
      { $project: { genre: "$_id", averagePrice: 1, _id: 0 } }
      ]).toArray();

      console.log(avgPricesByGenre);
      const bookCountsByAuthor = await books.aggregate([
      { $group: { _id: "$author", bookCount: { $sum: 1 } } },
      { $project: { author: "$_id", bookCount: 1, _id: 0 } }
      ]).toArray();
      console.log(bookCountsByAuthor);
      const decadeCounts = await books.aggregate([
        {
          $project:{
            decade: {
              $multiply: [
                { $floor: { $divide: ["$year", 10] } },
                10
              ]
            }
          }
        },
        { $group: { _id: "$decade", bookCount: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      
      ]).toArray();
      decadeCounts.forEach(element => {
      console.log(`Decade: ${element._id}, Book Count: ${element.bookCount}`);
      
    });
    console.log(decadeCounts);
    const index= await books.createIndex({ title: 1 }, { unique: true });
    console.log("Index created:");
    const compoundIndex = await books.createIndex({ author: 1, publishedYear:-1 });
    console.log("Compound index created:");








  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

// Run the queries
runQueries();
