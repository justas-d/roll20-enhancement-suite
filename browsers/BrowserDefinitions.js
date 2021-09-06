const Firefox = require('./Firefox');
const Chrome = require('./Chrome');

const browserDefinitions = {
  [Firefox.id]: Firefox, 
  [Chrome.id]: Chrome
};

module.exports = browserDefinitions;
