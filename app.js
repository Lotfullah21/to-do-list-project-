//requiring our installed libraries

const express = require("express");
const bodyParser = require("body-parser");
const _= require("lodash")

const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating new data base
mongoose.connect("mongodb://localhost:27017/listDB",{useNewUrlParser:true});
// creating schema
const listschema = {
   name:String,
}
//creating mongoose model
const List = mongoose.model("list",listschema)

//creating mongoose document by using our model
const item1 = new List({
  name:"coding"
})

const item2 = new List({
  name:"practicing"
})

const item3 = new List({
  name:"never giving up"
})

const main_El = [item1,item2,item3];

// creating new schema for our dynamic routes

const routeSchema = {
  name: String,
  items: [listschema]
};

const RouteEle = mongoose.model("element",routeSchema)



// checking if the list is empty or not 
app.get("/", function(req, res) {

  List.find({},function(err,found_items){
    if(found_items.length===0){
    List.insertMany(main_El,function(err){
    if (err){
     console.log("error")
  }
  else{
     console.log("successfully done")
  }
})
res.redirect("/")
}else{
  res.render("list", {listTitle: "Today", newListItems: found_items});
}
});

});
app.get("/:routeName",function(req,res){
  // capitilazing our route name 
  const Name = _.capitalize(req.params.routeName);
  RouteEle.findOne({name: Name},function(err,inList){
    if (!err){
      if(!inList){
        // if not in our founditems create a new list
        const newRouteEl =new RouteEle({
          name:Name,
          items:main_El
        });
        newRouteEl.save()
        res.redirect("/"+Name)
    }else{
      res.render("list",{listTitle:Name,newListItems:inList.items})
    }
  }
  })


});


// to post and save our new added data

app.post("/", function(req, res){
  const addeditems = req.body.in_item;
  const listName = req.body.list;
  let newItem = new List({
    name:addeditems
  })
  if(listName ==="Today"){
      newItem.save()
      res.redirect("/")
  }else{
    RouteEle.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  });


//adding delete route and using <modelname>.findByIdAndRemove() to delete elements with specific valuse
app.post("/delete",function(req,res){
  const checkedItems = req.body.checked;
  const list_hidden = req.body.hidden_list;
  if(list_hidden==="Today"){
    List.findByIdAndRemove(checkedItems,function(err){
      if(!err){
        console.log("succeccfully deleted")
        res.redirect("/")
      }
    })
  }else{
    RouteEle.findOneAndUpdate({name:list_hidden},{$pull:{items:{_id:checkedItems}}},function(err,found_item){
      if(!err){
        res.redirect("/"+list_hidden)
      }
    })
  }

})

app.listen(3000, function(){
  console.log("Server started on port 3000")
});
