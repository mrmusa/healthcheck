// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
const express = require('express');
const exphbs = require('express-handlebars');
const vm = require('vm');
const fs = require('fs');
const moment = require('moment');
const Bluebird = require('bluebird');
const readdir = Bluebird.promisify(fs.readdir);
const readFile = Bluebird.promisify(fs.readFile);
const path = require('path');
const sharp = require('sharp');
const proxy = require('http-proxy-middleware');

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Static directory
app.use(express.static('./public'));

if (process.env.NODE_ENV === 'production') {
  app.use('/reports', proxy({
    target: 'https://s3.amazonaws.com/gtjan2017/healthcheck',
    changeOrigin: true
  }));
}

// thumbnail generator with static file cache
app.use('/reports(/healthcheck|authcheck|teamcheck|mvccheck|testcheck|linkcheck)/assets/thumbs', (req, res) => {
  const original = path.join(__dirname, 'public', req.baseUrl.replace(/thumbs/ig, ''), req.path);
  const thumb = path.join(__dirname, 'public', req.baseUrl, req.path);
  sharp(original)
    .resize(220, 220)
    .max()
    .withoutEnlargement()
    .toFile(thumb)
    .then(() => res.status(200).sendFile(thumb))
    .catch(err => {
      console.log('err', err, original, thumb);
      res.status(404).send('Thumbnail Not Found');
    });
});

// Routes =============================================================
app.get('/', (req, res) => {
  const dirpath = path.join(__dirname, 'public', 'reports', 'healthcheck');
  readdir(dirpath)
    .filter(file => file.endsWith('.json'))
    .then(files => {
      return files.sort((a, b) => {
        if (a > b) {
          return -1;
        }
        if (a < b) {
          return 1;
        }
        // a must be equal to b
        return 0;
      })
    })
    .map(file => {
      return readFile(path.join(dirpath, file), { encoding: 'utf8' })
        .then(data => {
          const json = JSON.parse(data);
          const report = {
            meta: {
              reportUrl: `reports/healthcheck/${file.replace(/\.json/ig, '.html')}`
            },
            stats: {
              passes: json.stats.passes,
              failures: json.stats.failures,
              pending: json.stats.pending,
              timeFromNow: moment(json.stats.end).fromNow(),
            },
            allTests: json.allTests.map(({ fail, context: _context = '[]' }) => {
              const context = vm.runInThisContext(`context = ${_context};`);
              const [appUrl = '#', _thumb] = context;
              const thumb = _thumb ? path.join('reports', 'healthcheck', _thumb.replace(/assets\//ig, 'assets/thumbs/')) : 'http://placehold.it/220x165';
              return {
                fail,
                context: { thumb, appUrl }
              };
            })
          };
          return report;
        });
    }, { concurrency: 5 })
    .then(reports => {
      const giphy = {
        failed: [
          'https://media.giphy.com/media/MwOuiiTfWfWgM/giphy.gif',
          'https://media.giphy.com/media/xT77Y36ijyuwn58bja/giphy.gif',
          'https://media.giphy.com/media/l4FGGTztu9zLHe31m/giphy.gif',
          'https://media.giphy.com/media/xUA7b7wHQbY68IXvtm/giphy.gif'
        ],
        success: [
          'https://media.giphy.com/media/xUA7b7wHQbY68IXvtm/giphy.gif',
          'https://media.giphy.com/media/wYzFqVheF7gGY/giphy.gif',
          'https://media.giphy.com/media/SD1ZxXR7ttJqU/giphy.gif',
          'https://media.giphy.com/media/3Mgc5Rj8kSfsI/giphy.gif'
        ]
      };

      const status = reports[0].stats.failures ? 'failed' : 'success';

      res.render('healthcheck', {
        og: {
          url: 'https://gtjan2017-healthcheck.herokuapp.com',
          title: 'Project 2 Health Reports',
          description: 'Project 2 health check reports health and features for each app deployment and Git repo',
          siteName: 'Georgia Tech Coding Bootcamp',
          image: giphy[status][Math.floor(Math.random() * 100) % 4]
        },
        reports
      });
    })
    .catch(err => {
      console.log('err', err);
      res.status(500).send('Internal Error');
    })
});

app.listen(PORT, function () {
  console.log('App listening on PORT ' + PORT);
});