/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
var expect = require("chai").expect;
var mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

var bookSchema = new mongoose.Schema({
  title: String,
  comments: { type: [String], default: [] },
  commentcount: { type: Number, default: 0 },
});

var Book = mongoose.model("book", bookSchema);
module.exports = function (app, Book) {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks = [];
      Book.find({}, (error, results) => {
        if (!error && results) {
          results.forEach((result) => {
            let book = result.toJSON();
            book["commentcount"] = book.comments.length;
            arrayOfBooks.push(book);
          });
          return res.json(arrayOfBooks);
        }
      });
    })

    .post(async function (req, res) {
      let title = req.body.title;
      let book = new Book({ title: title });

      await book.save((err, data) => {
        if (err) return res.json("missing required field title");
        res.json({
          _id: data._id,
          title: data.title,
        });
      });
      //response will contain new book object including atleast _id and title
    })

    .delete(async function (req, res) {
      await Book.deleteMany({}, (err, data) => {
        if (err) return console.error(err);

        res.json("complete delete successful");
      });
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;

      if (!ObjectId.isValid(bookid)) return res.json("no book exists");

      await Book.findById(bookid, (err, data) => {
        if (err || !data) return res.json("no book exists");

        res.json(data);
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        res.json("missing required field comment");
      } else if (!ObjectId.isValid(bookid)) {
        res.json("no book exists");
      } else {
        let book = await Book.findById(bookid);
        if (!book) return res.json("no book exists");

        await Book.findByIdAndUpdate(bookid, {
          $push: { comments: comment },
          $inc: { commentcount: 1 },
        });

        await Book.findById(bookid, (err, data) => {
          res.json(data);
        });
      }
      //json res format same as .get
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;

      if (!ObjectId.isValid(bookid)) return res.json("no book exists");

      await Book.findByIdAndDelete(bookid, (err, data) => {
        if (err || !data) return res.json("no book exists");
        res.json("delete successful");
      });
      //if successful response will be 'delete successful'
    });
};
