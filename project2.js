const Nightmare = require('nightmare');
const assert = require('assert');
const path = require('path');
const addContext = require('mochawesome/addContext');
const moment = require('moment');

const projects = [
  {
    team: 'Illegal Operations',
    members: 'ryan, martin, jieun, emily',
    repo: 'https://github.com/rrodwell/IllegalOperations',
    app: 'https://illegal-formation.herokuapp.com/'
  },
  {
    team: 'Tab Nabbers',
    members: 'cody, eric g, esterling, ashley',
    repo: 'https://github.com/accimeesterlin/Tab-Nabbers.git',
    app: 'https://bootcruit.herokuapp.com'
  },
  {
    team: 'Strict Mode',
    members: 'les, trent, laurie, lisa',
    repo: 'https://github.com/haginl1/digitalPricing',
    app: 'https://warm-brushlands-86718.herokuapp.com/'
  },
  {
    team: 'Major Cache',
    members: 'matt, nicole, cashuna, heather',
    repo: 'https://github.com/lockwoni/plant-care',
    app: 'https://warm-savannah-50461.herokuapp.com/'
  },
  {
    team: 'Blue Smoke Magicians',
    members: 'usman, marvin, christine, val',
    repo: 'https://github.com/usmanjamil83/BlueSmokeMagicians',
    app: 'http://guarded-oasis-40298.herokuapp.com/'
  },
  {
    team: 'Aluminum Falcons',
    members: 'jesus, seila, roberto, sandy',
    repo: 'https://github.com/91integ25/Aluminum_falcons',
    app: 'https://limitless-everglades-23900.herokuapp.com/'
  },
  {
    team: 'Fighting Calypso Cookies',
    members: 'alex y, keythe, jimmia, heidi',
    repo: 'https://github.com/ayuan17/project2.git',
    app: 'https://warm-atoll-35828.herokuapp.com/'
  },
  {
    team: 'White Hot Snow',
    members: 'john b, brent, igho, monica',
    repo: 'https://github.com/Afroid/project2',
    app: 'https://lit-everglades-62722.herokuapp.com/'
  },
  {
    team: 'Bits & Giggles',
    members: 'david, karlos, alex d, zach',
    repo: 'https://github.com/ddye4265/bitsandgiggles',
    app: 'https://quiet-sea-77471.herokuapp.com'
  },
  {
    team: 'Massive Confection',
    members: 'nooshin, mike b, michelle, jackie',
    repo: 'https://github.com/mikesbass/studentSearch.git',
    app: "https://mysterious-island-39661.herokuapp.com/"
  },
  {
    team: 'File Jackers',
    members: 'shakir, eric f, caroline, trenton',
    repo: 'http://gt.bootcampcontent.com/filejackers/project-2',
    app: 'http://ga-tech.homuncul.us:8081/'
  },
  {
    team: 'Midnight Sun Giants',
    members: 'london, andrew, tyler, jameel',
    repo: 'https://github.com/TylerCovington/Group-Project-2',
    app: 'https://group-project-2.herokuapp.com/'
  },
  {
    team: 'Habitual Green Killers',
    members: 'sungbum, jon w, danny, sylvester',
    repo: 'https://github.com/dannyjwkim/Stock-Market-Game',
    app: 'https://whispering-eyrie-80456.herokuapp.com/'
  }
];


describe('Project 2 Health Check', function () {
  projects.forEach(({team, members, repo, app}, index) => {
    describe(`${team}: ${members}`, function () {
      this.timeout(20000);
      it('should render an app home page', function (done) {
        if (app) {
          const imagePath = path.join('assets', `${('00' + index).slice(-2)}-${team.replace(/ /ig, '-')}_${moment().format('YYYY-MM-DD_HH')}.png`);
          // context can be a url and the report will create a link
          addContext(this, app);
          // context can be an image url and the report will show it inline
          addContext(this, imagePath);

          addContext(this, repo);

          addContext(this, team);

          addContext(this, members);

          Nightmare({ show : false })
            .goto(app)
            .viewport(1024, 768)
            .screenshot(path.join(__dirname, 'public', 'reports', 'healthcheck', imagePath))
            .evaluate(() => document.title)
            .then(title => {
              const failed = ['Heroku | Welcome to your new app!', 'Application Error', 'Error'].includes(title);
              assert.ok(!failed, `${team} deployment is failed at ${app}`);
            })
            .catch(err => err)
            .then(done)
        } else {
          assert.ok(app, `${team} has not provided an app deployment url`);
        }
      })
    })
  });
});
