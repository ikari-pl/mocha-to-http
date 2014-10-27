#!/usr/bin/node
var git = require('git'),
    path = require('path'),
    mocha = require('mocha'),
    express = require('express'),
    exec = require('child_process').exec,
    app = express(),
    server;

function get_mocha_cmd(config) {
  return config.commands.test ?
    config.commands.test.replace('#{reporter}', config.default_reporter) :
    "node " + path.join("node_modules", "bin", "mocha");
};

function run_sequence(commands, out_stream, err_stream, done) {
  var cmd = commands[0];
  if (cmd) {
    console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {
      if (error !== null) {
        // Something bad happened
        console.warn('Oops: ');
        console.err(error);
        // and do not proceed.
      } else {
        // print stuff
        out_stream.write(stdout);
        err_stream.write(stderr);
        // and proceed to the next one
        run_sequence(commands.slice(1), out_stream, err_stream);
      }
    })
  } else {
    if (typeof done === 'function') {
      done();
    }
  }
}


app.get('/', function (req, res) {
  var conf = require('./config.json'),
    addr = server.address();
  conf['To execute the tests, go here: '] =
    'http://' + addr.address + ':' + addr.port + '/test';
  res.send(conf);
});

app.get('/test', function (req, res) {
  var conf = require('./config.json'),
  commands = conf.commands.before || [];
  commands.concat([get_mocha_cmd(conf)]);
  commands.concat(conf.commands.after);

  run_sequence(commands, res, process.stderr, function() {
    res.end();
  })
});

server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Testing app listening at http://%s:%s', host, port)

});
