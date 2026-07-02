const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'i18n', 'local');

function walk(targetDir) {
  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    const full = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const updated = content.replace(/export default\s+\{/, 'export default {');
      fs.writeFileSync(full, updated);
    }
  }
}

walk(dir);
