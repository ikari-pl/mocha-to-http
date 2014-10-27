“mocha to HTTP” test runner
===========================

This (**beta**) project is a quick and dirty way to wrap around your
mocha test runner (available as a global binary or node module) test
another of your project, after getting a HTTP request, and feed you
with the test results.


Setup
-----

 * copy `config.json.dist` to `config.json` and adjust, if you want.
 * if no adjustments made, `mocha` will try to find your tests in your
   subproject's `test/mocha.opts` file
 * go to `subject` (the project being the test subject) directory
 * remove the `subject/readme.txt` file (it tells you what the directory is for)
 * `git clone _YOUR_REPO_URL_ .` to checkout the project inside the `subject` directory.
 * `npm install` to make sure all its dependencies are there
 * go back to `mocha-to-http` directory (`cd ..`)
 * `./index.js` will run the test server


Configuration
-------------

The `config.json` has all you need to hack around:

* `default_reporter` — specifies the mocha reporter that will be used if none else specified in the URL parameters
* `cwd` — specifies the working directory for all the commands. Leaving `subject` is recommended.
* `commands.before` — an array of shell commands to be run before the tests. You can put `git pull` or `npm install` or `gulp` here, if you want.
We recommend using `1>&2` at the end of the command to redirect all standard output from the standard output (because that will be returned in the HTTP body) to error output (because that only gets logged on the server console).
* `commands.test` — the `mocha` command line, if you need any special and custom parameters, or `null` if reading the standard `mocha.opts` is fine. We use this, because `mocha.opts` seems incompatible with the coffeescript+testem configuration that we use in the subject project.
* `commands.after` — any cleanup after tests?


TODO
----

A lot. Console output is noisy, the code isn't as pretty as it could for such a simple project.
In theory, Windows should be supported, but I'm not sure yet.
