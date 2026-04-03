const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

router.post('/run', (req, res) => {
  const { code, language, input } = req.body;

  let tmpFile, command;

  if (language === 'python') {
    tmpFile = path.join(os.tmpdir(), 'temp.py');
    command = `python "${tmpFile}"`;
  } else {
    tmpFile = path.join(os.tmpdir(), 'temp.js');
    command = `node "${tmpFile}"`;
  }

  fs.writeFileSync(tmpFile, code);

  const child = exec(command, (error, stdout, stderr) => {
    fs.unlinkSync(tmpFile);
    if (error) return res.json({ error: error.message });
    if (stderr && !stdout) return res.json({ error: stderr });
    res.json({ output: stdout });
  });

  if (input) child.stdin.write(input);
  child.stdin.end();
});

module.exports = router;