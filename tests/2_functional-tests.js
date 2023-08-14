const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const tests = require('./tests')

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('POST request to /api/issues/{project}', function() {
    test('Create an issue with every field', async function() {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(tests[0])
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.property(res.body, "issue_title")
          assert.property(res.body, "issue_text")
          assert.property(res.body, "created_by")
          assert.property(res.body, "assigned_to")
          assert.property(res.body, "status_text")
          assert.property(res.body, "_id")
          assert.isNumber(Date.parse(res.body.updated_at)) // Date.parse converts seconds             
          assert.isNumber(Date.parse(res.body.created_on))
          assert.isTrue(res.body.open)
        });
    });
    
    test('Create an issue with only required fields', async function() {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(tests[1])
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.property(res.body, "issue_title")
          assert.property(res.body, "issue_text")
          assert.property(res.body, "created_by")
          assert.isEmpty(res.body.assigned_to)
          assert.isEmpty(res.body.status_text)
        });
    });
    
    test('Create an issue with missing required fields', async function() {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(tests[2])
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.equal(res.body.error, "required field(s) missing")
        });
    });
  });

  suite('GET request to /api/issues/{project}', function() {
    test('View issues on a project', async function() {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest')
        .query(tests[3])
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], "issue_title")
          assert.property(res.body[0], "issue_text")
          assert.property(res.body[0], "created_by")
          assert.property(res.body[0], "assigned_to")
          assert.property(res.body[0], "status_text")
          assert.property(res.body[0], "_id")
          assert.isNumber(Date.parse(res.body[0].updated_at)) 
          assert.isNumber(Date.parse(res.body[0].created_on))
          assert.isTrue(res.body[0].open)
        });
    });
    
    test('View issues on a project with one filter', async function() {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest')
        .query(tests[4])
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 1);
          assert.equal(res.body[0].created_by, 'Charles');
        });
    });
    
    test('View issues on a project with multiple filters', async function() {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest')
        .query(tests[5])
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 2);
          assert.equal(res.body[0].created_by, 'Can');
          assert.equal(res.body[0].assigned_to, 'Kelly');
          assert.equal(res.body[1].created_by, 'Can');
          assert.equal(res.body[1].assigned_to, 'Kelly');
        });
    });
  });

  suite('PUT request to /api/issues/{project}', function() {
    test('Update one field on an issue', async function() {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(tests[6])
        .end((err, res) => {
          assert.equal(res.status, 200)
        });
    });
    
    test('Update multiple fields on an issue', async function() {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(tests[7])
        .end((err, res) => {
          assert.equal(res.status, 200)
        });
    });
    
    test('Update an issue with missing _id', async function() {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(tests[8])
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "missing _id" });
        });
    });
    
    test('Update an issue with no fields to update', async function() {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(tests[9])
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, "no update field(s) sent");
        });
    });
    
    test('Update an issue with an invalid _id', async function() {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(tests[10])
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, "could not update");
        });
    });
  });

  suite('DELETE request to /api/issues/{project}', function() {
    test('Delete an issue', async function() {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(tests[11])
        .end((err, res) => {
          chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/apitest')
            .send({_id: res.body._id})
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.isObject(res.body);
              assert.equal(res.body.result, "successfully deleted");
            })          
        });
    });
    
    test('Delete an issue with an invalid _id', async function() {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send(tests[12])
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, "could not delete");
        });
    });
    
    test('Delete an issue with missing _id', async function() {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, "missing _id");
        });
    });
  }); 
  
});
