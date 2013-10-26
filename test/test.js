var mongoose = require('mongoose')
  , should = require('should')
  , autoIncrement = require('../index.js');

mongoose.connect('mongodb://localhost/mongoose-auto-increment-test');

after(function(done) {
  mongoose.connection.db.executeDbCommand( {dropDatabase:1}, function(err, result) {
    done();
  });
});

autoIncrement.initialize(mongoose.connection);

describe('Auto Increment Plugin', function() {

  it('should auto-increment in _id', function(done) {

    var SomeSchema = new mongoose.Schema({
      name: String,
      dept: String
    });
    SomeSchema.plugin(autoIncrement.plugin, 'ai_id');
    var User = mongoose.model('ai_id', SomeSchema);
    var user = new User({ name: 'Name test', dept: 'Department test' });

    user.save(function(err) {
      should.not.exists(err);
      user._id.should.eql(0);
      done();
    });
  });

  it('should auto-increment in another field', function(done) {
    var SomeSchema = new mongoose.Schema({
      name: String,
      dept: String,
      sequence: Number
    });
    SomeSchema.plugin(autoIncrement.plugin, {model: 'ai_another_field', field: 'sequence'});
    var User = mongoose.model('ai_another_field', SomeSchema);

    var user = new User({ name: 'Name test', dept: 'Department test' });
    user.save(function(err) {
      should.not.exists(err);
      user.sequence.should.eql(0);
      done();
    });
  });

  it('should start at selected number', function(done) {
    var SomeSchema = new mongoose.Schema({
      name: String,
      dept: String
    });
    SomeSchema.plugin(autoIncrement.plugin, {model: 'ai_start_at', startAt: 3});
    var User = mongoose.model('ai_start_at', SomeSchema);

    var user = new User({ name: 'Name test', dept: 'Department test' });
    user.save(function(err) {
      should.not.exists(err);
      user._id.should.eql(3);
      done();
    });
  });

  it('should increment in accordance with the selected number', function(done) {
    var SomeSchema = new mongoose.Schema({
      name: String,
      dept: String
    });
    SomeSchema.plugin(autoIncrement.plugin, {model: 'incrementBy', incrementBy: 5});
    var User = mongoose.model('incrementBy', SomeSchema);

    var user = new User({ name: 'Name test', dept: 'Department test' });


    user.save(function(err) {
      should.not.exists(err);
      user._id.should.eql(4);

      var user2 = new User({ name: 'Name test 2', dept: 'Department test' });
      user2.save(function(err) {
        should.not.exists(err);
        user2._id.should.eql(9);
        done();
      });
    });
  });

  // Can't be made with _id field.
  it('should increment on update', function(done) {
    var SomeSchema = new mongoose.Schema({
      name: String,
      dept: String,
      sequence: Number
    });
    SomeSchema.plugin(autoIncrement.plugin, {model: 'incrementOnUpdate', field: 'sequence', incrementOnUpdate: true});
    var User = mongoose.model('incrementOnUpdate', SomeSchema);
    var user = new User({ name: 'Name test', dept: 'Department test' });

    user.save(function(err) {
      should.not.exists(err);
      user.sequence.should.eql(0);
      user.name = 'Name change test';
      user.save(function(err) {
        should.not.exists(err);
        user.sequence.should.eql(1);
        done();
      });
    });

  });

  it('should return the next number', function(done) {
    var SomeSchema = new mongoose.Schema({
      name: String,
      dept: String,
      sequence: Number
    });
    SomeSchema.plugin(autoIncrement.plugin, {model: 'next', field: 'nextField'});
    var User = mongoose.model('next', SomeSchema);
    var user = new User({name: 'name test', dept: 'dept test'});
    user.nextAutoIncrement(function(err, res) {
      should.not.exists(err);
      res.should.eql(0);
      user.save(function(err) {
        should.not.exists(err);
        user.nextAutoIncrement(function(err, res) {
          should.not.exists(err);
          res.should.eql(1);
          var user2 = new User({name: 'name test2', dept: 'dept test2'});
          user2.save(function() {
            user2.nextField.should.eql(1);
            User.nextAutoIncrement(function(err, res) {
              should.not.exists(err);
              res.should.eql(2);
              done();
            });
          });
        });
      });
    });
  });
});
