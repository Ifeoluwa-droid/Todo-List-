const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require("mongoose");
const _ = require('lodash');

const port = 3000;
const app = express();

app.set('view engine', 'ejs');

// const items = ['Buy Food', 'Cook Food', 'Eat Food'];
// const workItems = [];

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

mongoose.connect("mongodb+srv://Ifeoluwa:ifeyfaro2001FD@cluster0.vllpj.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema); // Items collection

const item1 = new Item({    // item document
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);


// Item.insertMany(defaultItems, (err) => {
//   if (err) console.log(err);
//   else console.log("Saved defaultItems Successfully");
// });

app.get('/', (req, res) => {

  // const day = date.getDate();
  //
  // // let day = date.getDay();

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          if (err) console.log(err);
          else console.log("Save Successful");
        });
        res.redirect('/')
      } else {
        res.render('list', {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    }
  });
});

app.post('/', (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === 'Today') {
    newItem.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, (err) => { // mongoose method
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect('/');
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      (err, result) => {
        if (!err) {
          res.redirect(`/${listName}`);
        };
      }
    );
  }
});

// app.get('/work', (req, res) => {
//
//   res.render('list', {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create a new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        // Show an existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
});

app.post('/work', (req, res) => {

  const item = req.body.newItem;
  workItems.push(item);

  res.redirect("/work");
});


app.get('/about', (req, res) => {
  res.render("about");
})

app.listen(port, () => {
  const message = `Server started on port ${port}`
  console.log(message);
})
