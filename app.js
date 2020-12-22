var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
var flash = require("connect-flash");
var params = require("./params/params");
var misign = require("./routes/api/misign");
//var newWhitelist = require("url-whitelist");

var setUpPassport = require("./setuppassport");
//var routes = require("./routes");

var qrCodeURL;

//whitelist = newWhitelist();

//whitelist.include('');

var app = express();
mongoose.connect(params.DATABASECONNECTION, {useUnifiedTopology:true, useNewUrlParser:true, useCreateIndex:true});
setUpPassport();

app.set("port", process.env.PORT || 10008);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    secret:"doemlfgddfsoi!gjdsf5684561dsf",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

app.get('/QRcode-with-logo.js',function(req,res){
    //console.log("__dirname="+__dirname+'/assets/vendor/qrcode-with-logos/dist/QRcode-with-logo.js');
    res.sendFile(path.join(__dirname + '/routes/web/assets/vendor/qrcode-with-logos/dist/QRcode-with-logo.js')); 
 });



app.use("/images",express.static('./routes/web/assets/images'));

app.get('/generateqrcode', function (req, res) {
    var qrCodeParams = misign.getQRCodeParams(req.headers.state); // 
    misign.qrCodeGenerator.generateQRCode(qrCodeParams.qrType, qrCodeParams.callbackURL, qrCodeParams.clientId, qrCodeParams.state, qrCodeParams.nonce, qrCodeParams.signatureMethod, qrCodeParams.timeStampEnd, qrCodeParams.timeStampStart, qrCodeParams.version)
      .then(generatedQR => {
        qrCodeURL = generatedQR;
        console.log("qr url=" + qrCodeURL);
        res.send(qrCodeURL);

      }, error => {
        res.sendStatus(500);
      })
});

//mock function to return qrcode to simulate qrcode scan for SPM
app.get('/qrcode', function (req, res) {
  res.send(qrCodeURL);
});



app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
})
