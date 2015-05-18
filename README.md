# Workaround for Node.js issue #25339: Normalizes arguments on Windows

## Installation

```
npm install node_issue_25339_workaround
```

## Usage

```
var fixArgsOnWindows = require('node_issue_25339_workaround');

var args = fixArgsOnWindows(process.argv);
// Use args...
```