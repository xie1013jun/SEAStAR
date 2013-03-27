// Generated by CoffeeScript 1.6.1
(function() {
  var end, fn, fs, instream, len, num_parts, part_num, per_read, start, stats, util, _ref;

  fs = require('fs');

  util = require('util');

  process.on('uncaughtException', function(err) {
    process.stderr.write("Caught exception: " + err + "\n");
    return process.exit(1);
  });

  _ref = process.argv.slice(2, 5), fn = _ref[0], num_parts = _ref[1], part_num = _ref[2];

  num_parts = parseInt(num_parts);

  part_num = parseInt(part_num);

  if (num_parts < 1 || !((0 < part_num && part_num <= num_parts))) {
    process.stderr.write("Error: number of parts must be > 0 and part number(s) must be [1...num_parts]\n");
    process.exit(1);
  }

  len = 0;

  start = 0;

  stats = fs.statSync(fn);

  if (!stats.isFile()) {
    process.stderr.write("Error: Input must be a seekable file.\n");
    process.exit(1);
  } else {
    len = stats.size;
    start = Math.floor(len * (part_num - 1) / num_parts);
    end = Math.floor(len * part_num / num_parts);
    process.stderr.write("Part " + part_num + " of " + num_parts + " of File: " + fn + "\n");
    process.stderr.write("File is " + len + " bytes long, starting at byte " + start + "\n");
  }

  instream = fs.createReadStream(fn, {
    flags: 'r',
    encoding: 'ascii',
    bufferSize: Math.pow(2, 16),
    start: start
  }).on('open', function(fd) {
    return process.stderr.write("Stream opened on file descriptor " + fd + "\n");
  }).on('data', (function() {
    var data_used, save, save_lines;
    save = '';
    save_lines = [];
    data_used = 0;
    return function(c) {
      var l, lines, _i, _len, _ref1;
      c = save + c;
      lines = c.split('\n');
      lines = save_lines.concat(lines);
      save = lines.pop();
      while (lines.length > 4 && (lines[0][0] !== '@' || lines[2][0] !== '+')) {
        data_used += lines[0].length + 1;
        lines.shift();
      }
      while ((lines.length >= 4) && (start + data_used < end)) {
        _ref1 = lines.slice(0, 4);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          l = _ref1[_i];
          data_used += l.length + 1;
        }
        per_read(lines.splice(0, 4));
      }
      if (start + data_used >= end) {
        process.stderr.write("" + data_used + " bytes consumed. Should stop at " + end + "\n");
        process.exit(1);
      }
      return save_lines = lines;
    };
  })());

  per_read = function(ra) {
    var i, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = ra.length; _i < _len; _i++) {
      i = ra[_i];
      _results.push(process.stdout.write("" + i + "\n"));
    }
    return _results;
  };

}).call(this);