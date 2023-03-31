//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Database connection//
mongoose.connect("mongodb+srv://spandita:Spandita8420@cluster0.finzdv5.mongodb.net/todolistDB");

// Creating database schema
const itemsSchema = {
  name: String
};

// Creating database model
const Item = mongoose.model("Item", itemsSchema);

// Create new document/record using mongoose
const item1 = new Item({
  name: "Welcome to your to d list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item!"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item!"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Insert many into //
// Item.insertMany(defaultItems).then(function(){
//     console.log("Successfully saved default items to DB.");
//   })
//   .catch(function(err){
//     console.log(err);
//   });



app.get("/", async function(req, res) {


  const foundItems = await Item.find({});

  if(foundItems.length === 0)
  {
    Item.insertMany(defaultItems).then(function(){
        console.log("Successfully saved default items to DB.");
      })
      .catch(function(err){
        console.log(err);
      });

      res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item ({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    const foundList = await List.findOne({name: listName});
    if(foundList)
    {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", async function(req,res)
{
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");
  }
  else{
    const updateDeletedList = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
    res.redirect("/" +listName);
  }
})

// Route parameters //

app.get("/:customListName", async function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  const foundList = await List.findOne({name: customListName});
  if(!foundList)
  {
    // Create a new list
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  }
  else{
    // Show an existing list
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
  }




})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
