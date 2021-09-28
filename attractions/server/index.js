const express = require("express");

const mongoose = require("mongoose")

const Attraction = require('./Schema')

const path = require("path")
const PORT = process.env.PORT || 3001;

const session = require("express-session")

const MongoDBStore = require("connect-mongodb-session")(session)

const bodyParser = require('body-parser');

const csrf = require('csurf')

var csrfProtection = csrf()




const store = new MongoDBStore({
  uri: MongoURI,
  collection: "MySessions"
})


// const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest



const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(session({
  secret: "udfgdkjuhihsgvygvdsghbfwefkwm4i5n3ubdfhg7b374y5b334",
  resave: false,
  saveUninitialized: false,
  store: store,
  expires: new Date(Date.now() + (30 * 86400 * 1000))
}))
app.use(bodyParser.urlencoded({ extended: true }));


function sort_by_key(array, key) {
  return array.sort(function (a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
app.set('view engine', 'ejs');
mongoose.connect('mongodb+srv://root:gzdfCUK28v4D6iVK@cluster0.ogifr.mongodb.net/Attraction?retryWrites=true&w=majority').then(() => console.log("connected"))
//https://data.gov.il/api/3/action/datastore_search?resource_id=29f4ec99-ec7f-43c1-947e-60a960980607&limit=40 *********** database of Attractions
// const endpoint = "https://data.gov.il/api/3/action/datastore_search?resource_id=29f4ec99-ec7f-43c1-947e-60a960980607&limit=40"
// function loadXMLDoc() {
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       const json =  JSON.parse(this.responseText).result.records
//       for(let i=0;i<40;i++){
//         const temp = json[i]
//         delete temp._id
//         const attraction = new Attraction(temp)
//         attraction.save((err)=>console.log(err))
//********************************** executed only once ************************************

//       }
//     }
//   }
//   xhttp.open("GET", endpoint, true);
//   xhttp.send();
// }


function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
  return Value * Math.PI / 180;
}


app.get("/api", csrfProtection, (req, res) => {
  if (!req.session.Attraction) {
    req.session.Attraction = []
  }

  let distanceArray = []
  if (req.query.filter) {
    if (req.query.filter === 'האטרקציות שלי') {
      return res.render('attractions', { distance: req.session.Attraction, latitude: req.query.latitude, longitude: req.query.longitude, path: 'האטרקציות שלי', csrfToken: req.csrfToken() })
    }
    Attraction.find({ Attraction_Type: req.query.filter }).exec().then((docs) => {
      docs.forEach((value, index) => {
        distanceArray[index] = { distance: Math.round(calcCrow(value.Y, value.X, parseFloat(req.query.latitude), parseFloat(req.query.longitude))), value }
      })
      distanceArray = sort_by_key(distanceArray, "distance")
      res.render('attractions', { distance: distanceArray, latitude: req.query.latitude, longitude: req.query.longitude, path: req.query.filter, csrfToken: req.csrfToken() })
    }).catch(err => console.log(err))
  }
  else {
    Attraction.find({}).exec().then((docs) => {
      docs.forEach((value, index) => {
        distanceArray[index] = { distance: Math.round(calcCrow(value.Y, value.X, parseFloat(req.query.latitude), parseFloat(req.query.longitude), value.Y, value.X)), value }
      })
      distanceArray = sort_by_key(distanceArray, "distance")
      res.render('attractions', { distance: distanceArray, latitude: req.query.latitude, longitude: req.query.longitude, path: undefined, csrfToken: req.csrfToken() })
    }).catch(err => console.log(err))
  }
});

app.post('/api', csrfProtection, (req, res) => {
  if (!req.session.Attraction) {
    return res.redirect('/')
  }
  if (req.body.delete === "true") {
    req.session.Attraction = req.session.Attraction.filter((value) => {
      return value.value._id.toString() !== req.body.id
    })
    return res.redirect(`/api?latitude=${req.body.latitude}&longitude=${req.body.longitude}`)
  }
  Attraction.findById(req.body.id).exec().then((Attraction) => {
    req.session.Attraction.push({ value: Attraction, distance: req.body.distance })
    console.log(req.session.Attraction)
    res.render('attractions', { distance: req.session.Attraction, latitude: req.body.latitude, longitude: req.body.longitude, path: 'האטרקציות שלי', csrfToken: req.csrfToken() })
  }).catch((err) => {
    console.log(err)
  })
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

