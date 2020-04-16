
import mongoose from 'mongoose';

const url = "mongodb://localhost/siFame";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

var Schema = mongoose.Schema;

var FameSchema =  new Schema({
    id: Number,
    image: String,
    description: String,
    fame: Boolean,
    name: String,
    surname: String,
    age: Number,
    ethnicity: String,
    nationality: String,
    gender: String
});

var UserSchema =  new Schema({
    image: String,
    name: String,
    surname: String,
    age: Number,
    nationality: String,
    gender: String
});

var Fame = mongoose.model('fame_collections',FameSchema);
var User = mongoose.model('user_collection',UserSchema);

function InsertData(data,filter){
    const FameOrUser = filter ? User : Fame;
    var result = null;
            FameOrUser.insertMany(data,function(err){
                if(err){
                    return console.log(err);
                }else{
                   // return console.log("ok");
                }
            });           
}


async function GetDataRandom(filter,fields,options){

   const query = Fame.aggregate([
        { $match: filter },
        { $sample: options},
        //{ $group: { _id: "$_id", image: "$image"  } }
    ])

    query.exec(function (err, value) {
        if(err) return next(err);
           return value
    });
    
    return query;
  }
       

async function GetData(filter,condition){
    /*@Param
        filter.type = "name of field" 
        //for multiple field//
        filter.type = "field field field"
        //remove _id or any other field with multiple field , filter.type = "field field -_id"

      @Param
      filter.option = "gender : 'man'"  
      @Param
      condition.ok = true is for Fame, false is for user;
      condition.image = this is for searching person according to image name 
        */
       const FameOrUser = condition.ok ? User : Fame;
       var query = null;
       if(condition.ok){
                    query = FameOrUser.findOne({image: condition.image}).select(filter.type);
                            query.exec(function (err, value) {
                                if(err) return next(err);
                                    return value;
                            });
       }else{
            if(filter){
                    query = FameOrUser.find({gender: filter.gender}).select(filter.type);
                        query.exec(function (err, someValue) {
                            if (err) return next(err);
                            return someValue;
                        });
            }else{     
                    query = FameOrUser.find({});
                        query.exec(function (err,someValue){
                            if(err) return next(err);
                            return someValue;
                        })
            }
        }
    return query;
}

async function CountCollection(){
    var query = null;
            query = Fame.countDocuments({});
            query.exec(function(err, count){
                if(err) return next(err);
                return count;
            })
   return query;
}

module.exports = {
    InsertData,
    GetData,
    CountCollection,
    GetDataRandom,
}