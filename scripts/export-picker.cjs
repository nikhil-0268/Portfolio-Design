const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const section = read('page2.html').match(/<section\s+class="lucky-project-picker"[\s\S]*?<\/section>/)[0];
const document = '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lucky finds — project picker</title><link rel="stylesheet" href="slot-picker.css"><script src="slot-picker.js" defer></script></head>\n<body>' + section + '</body></html>\n';
fs.writeFileSync(path.join(root, 'lucky-slot-projects.html'), document);
let script = read('slot-picker.js');
for (const [name, type] of [['red-machine.jpg', 'image/jpeg'], ['dice.png', 'image/png'], ['jackpot-badge.png', 'image/png']]) {
  const image = fs.readFileSync(path.join(root, 'slot-assets', name)).toString('base64');
  script = script.replace('slot-assets/' + name, 'data:' + type + ';base64,' + image);
}
const standalone = document.replace('<link rel="stylesheet" href="slot-picker.css">', () => '<style>' + read('slot-picker.css') + '</style>').replace('<script src="slot-picker.js" defer></script>', '').replace('</section>', () => '<script>' + script + '</script></section>');
fs.writeFileSync(path.join(root, 'lucky-slot-projects-single-file.html'), standalone);
