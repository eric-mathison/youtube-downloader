/* eslint-disable no-unused-expressions */
const app = require('../src');

describe('Get /', () => {
    it('should resolve', done => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.be.status(200);
                done();
            });
    });
});
