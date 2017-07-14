require('./check-versions')();

const config = require('../config');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV);
}

const opn = require('opn');
const path = require('path');
const joinPath = require('path.join');
const express = require('express');
const webpack = require('webpack');
const mongoose = require('mongoose');
const fs = require('fs');
const proxyMiddleware = require('http-proxy-middleware');
const webpackConfig = require('./webpack.dev.conf');
const bodyParser = require('body-parser');
const schema = require('./schema.js');
const session = require('express-session');
const Client = require('./sparcsssov2');

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port;
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser;
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable;

const app = express();
const compiler = webpack(webpackConfig);

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true,
});

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {},
});


// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', (compilation) => {
  compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
    hotMiddleware.publish({ action: 'reload' });
    cb();
  });
});

// proxy api requests
Object.keys(proxyTable).forEach((context) => {
  let options = proxyTable[context];
  if (typeof options === 'string') {
    options = { target: options };
  }
  app.use(proxyMiddleware(options.filter || context, options));
});

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')());

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// Use express-session for save session
app.use(session({
  key: 'destroyKey',
  resave: false,
  saveUninitialized: true,
  secret: 'secretkey',
  cookie: {
    maxAge: 1000 * 60 * 60, // 1hour
  },
  // store: new MongoStore(options),
}));

// set for SSO connecting. for dev
const client = new Client('teste0b822cdafbe', '4a68305ccb64c7b944bc', false);

// Javascript have no function for set default value.
function getKey(dict, key, replacement) {
  if (Object.prototype.hasOwnProperty.call(dict, key)) {
    return dict[key];
  }
  return replacement;
}

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory);
app.use(staticPath, express.static('./static'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

const uri = `http://localhost:${port}`;
const imgPath = `${staticPath}/images/`;
const seminarPath = `${staticPath}/seminars/`;

devMiddleware.waitUntilValid(() => {
  console.log(`> Listening at ${uri}\n`);
});

// Database
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  // CONNECTED TO MONGODB SERVER
  console.log('Connected to mongod server');
});

mongoose.connect('mongodb://localhost/sparcs_home');

app.post('/album/newYear', (req, res) => {
  const json = req.body;
  const year = new schema.Years({
    year: json.year,
    eventNumber: 1,
    photoNumber: 1,
    albums: [],
  });
  year.save((err) => {
    if (err) console.log(`some error occured.. ${err}`);
    else {
      console.log('successfully saved screenshot!');
      res.send({ success: true });
    }
  });
});

function saveImageSync(base64Data) {
  const strImage = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const imageBuffer = new Buffer(strImage, 'base64');
  const fileName = `img_${Date.now()}.jpg`;
  const filePath = joinPath(__dirname, '/..', imgPath, fileName);
  console.log(filePath);
  fs.writeFileSync(filePath, imageBuffer);
  const url = uri + imgPath + fileName;
  return url;
}

app.post('/album/upload', (req, res) => {
  const { year, album, albumDate, newAlbum, photoList } = req.body;
  const photoNumber = photoList.length;
  let albumInc = 0;
  if (newAlbum) albumInc += 1;
  for (let i = 0; i < photoNumber; i += 1) {
    photoList[i] = saveImageSync(photoList[i]);
  }
  schema.Years.findOneAndUpdate(
    { year },
    {
      $inc: { eventNumber: albumInc, photoNumber },
      $addToSet: { albums: album },
      $setOnInsert: { year },
    },
    {
      upsert: true,
      returnNewDocument: true,
    },
    (err1, res1) => {
      if (err1) {
        res.send({ success: false });
        console.log(err1);
      } else {
        console.log(res1);
        schema.Albums.findOneAndUpdate(
          { title: album },
          {
            $inc: { photoNumber },
            $pushAll: { photos: photoList },
            $setOnInsert: { year, title: album, date: albumDate },
          },
          {
            upsert: true,
            returnNewDocument: true,
          },
          (err2, res2) => {
            if (err2) {
              res.send({ success: false });
              console.log(err2);
            } else {
              console.log('succeed in uploading photo');
              console.log(res2);
              res.send({ success: true, result1: res1, result2: res2 });
            }
          });
      }
    });
});

app.get('/album/getAlbum', (req, res) => {
  schema.Years.find({}, (err1, years) => {
    if (err1) res.send({ years: [] });
    else {
      schema.Albums.find({}, (err2, albums) => {
        if (err2) res.send({ years });
        res.send({ years, albums });
      });
    }
  });
});

app.post('/db/seminars', (req, res) => {
  const { title, speaker, date, content } = req.body;

  const strContent = content.replace(/^data:application\/pdf;base64,/, '');
  const buffer = new Buffer(strContent, 'base64');
  const titleWithUnderscores = title.replace(' ', '_');
  const fileName = `${speaker}_${titleWithUnderscores}.pdf`;
  const filePath = joinPath(__dirname, '/..', seminarPath, fileName);
  const url = uri + seminarPath + fileName;
  fs.writeFileSync(filePath, buffer);

  const sources = [url];
  const tuple = new schema.Seminars({ title, speaker, date, sources });
  tuple.save((err) => {
    if (err) {
      console.log(err);
      res.send({ success: false });
    } else res.send({ success: true });
  });
});

app.get('/db/seminars', (req, res) => {
  schema.Seminars.find({}, (err, seminars) => {
    if (err) res.send({ seminars: [] });
    else res.send({ seminars });
  });
});

app.get('/login', (req, res) => {
  const sess = req.session;
  if (Object.prototype.hasOwnProperty.call(sess, 'authenticated') && sess.authenticated === true) {
    return res.redirect(getKey(sess, 'next', '/'));
  }
  const [loginUrl, state] = client.getLoginParams();
  sess.ssoState = state;
  console.log(sess);
  console.log(loginUrl);
  return res.redirect(loginUrl);
});

app.get('/login/callback', (req, res) => {
  const sess = req.session;
  const stateBefore = getKey(sess, 'ssoState', 'default');

  const state = getKey(req.query, 'state', '');
  if (stateBefore !== state) {
    throw new Error('TOKEN MISMATCH: session might be hijacked!');
  }

  const code = getKey(req.query, 'code', '');

  client.getUserInfo(code)
          .then((resp) => {
            sess.authenticated = true;
            sess.sid = resp.sid;
            if (resp.sparcs_id) {
              sess.sparcsId = resp.sparcs_id;
              sess.isSPARCS = true;
            } else {
              sess.isSPARCS = false;
            }
            console.log('=========================');
            console.log(resp);
            console.log('=========================');
            console.log(sess);

            let next;
            if (Object.prototype.hasOwnProperty.call(sess, 'next')) {
              next = sess.next;
              delete sess.next;
            } else {
              next = '/';
            }
            return res.redirect(next);
          });
});

app.get('/logout', (req, res) => {
  const sess = req.session;
  if (!sess.authenticated) {
    console.log('REDIRECTED');
    return res.redirect('/');
  }
  const sid = getKey(sess, 'sid', '');
  client.getLogoutUrl(sid, '/');
  req.session.destroy();
  res.clearCookie('destroyKey');
  return res.redirect('/');
});

module.exports = app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri);
  }
});
