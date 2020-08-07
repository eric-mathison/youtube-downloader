const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;

global.chai = chai;
global.expect = expect;

chai.use(chaiHttp);
