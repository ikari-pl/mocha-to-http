#!/usr/bin/node
var git = require('git'),
    path = require('path'),
    mocha = require('mocha'),
    express = require('express'),
    exec = require('child_process').exec,
    app = express(),
    dir = process.cwd(),
    server;

function get_mocha_cmd(config) {
  return config.commands.test ||
    "node " + path.join("node_modules", ".bin", "mocha") + ' -C --reporter #{reporter}';
};

function run_sequence(commands, res, done) {
  var cmd = commands[0];
  if (cmd) {
    console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {
      if (error !== null) {
        // Something bad happened
        console.warn('Oops: ');
        console.error(error);
        // and do not proceed.
        res.status(503);
        res.write(JSON.stringify({
          error: error,
          message: stderr
        }));
        res.end();
      } else {
        // print stuff
        res.write(stdout);
        process.stderr.write(stderr);
        // and proceed to the next one
        run_sequence(commands.slice(1), res, done);
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
    addr = server.address(),
    url = 'http://' + addr.address + ':' + addr.port + '/test';
  conf['To execute the tests, go here: '] = url;
  conf[' or specify a reporter: '] = url+'?reporter=tap'
  res.send(conf);
});

app.get('/test', function (req, res) {
  var conf = require('./config.json'),
    reporter = req.param('reporter') || conf.default_reporter,
    commands;

  // sanitize
  reporter = reporter.replace(/[^A-Za-z_-]/, '');
  // reset to my home
  process.chdir(dir);
  // and chdir from there
  process.chdir(conf.cwd);
  console.log('cd ' + process.cwd());

  commands = (conf.commands.before || []).concat();
  commands.push(get_mocha_cmd(conf).replace('#{reporter}', reporter ));
  commands = commands.concat(conf.commands.after);

  console.log(commands);

  run_sequence(commands, res, function() {
    res.end();
    process.chdir(dir);
  })
});

server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Testing app listening at http://%s:%s', host, port)

});
