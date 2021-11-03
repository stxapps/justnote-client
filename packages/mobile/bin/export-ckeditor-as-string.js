const fs = require('fs');

const coreJsPath = process.argv[2];
const ckeditorJsPath = process.argv[3];
const tailwindCssPath = process.argv[4];
const ckeditorCssPath = process.argv[5];
const htmlPath = process.argv[6];
const outputPath = process.argv[7];

const readLines = (fpath) => {

  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.split('\n')
    .filter(line => {
      const i = line.indexOf('//');
      if (i >= 0) {
        if (i - 5 >= 0 && line.slice(i - 5, i) === 'http:') return true;
        if (i - 6 >= 0 && line.slice(i - 6, i) === 'https:') return true;
        if (i - 5 >= 0 && line.slice(i - 5, i) === 'file:') return true;
        if (i - 1 >= 0 && line.slice(i - 1, i) === '"') return true;

        console.log(`Line with a comment deleted: ${line}`);
        return false;
      }
      return true;
    })
    .map(line => line.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"'));

  return lines;
};

const coreJsText = '<script>' + readLines(coreJsPath).join(' ') + '</script>';
const ckeditorJsText = '<script>' + readLines(ckeditorJsPath).join(' ') + '</script>';
const tailwindCssText = '<style>' + readLines(tailwindCssPath).join(' ') + '</style>';
const ckeditorCssText = '<style>' + readLines(ckeditorCssPath).join(' ') + '</style>';

const htmlText = readLines(htmlPath)
  .map(line => {
    if (line.includes('<script src=\\"/core-js/minified.js\\"></script>')) {
      return coreJsText;
    }
    if (line.includes('<script src=\\"/js/ckeditor.js\\"></script>')) {
      return ckeditorJsText;
    }
    if (line.includes('<link rel=\\"stylesheet\\" href=\\"/css/tailwind.css\\">')) {
      return tailwindCssText;
    }
    if (line.includes('<link rel=\\"stylesheet\\" href=\\"/css/ckeditor.css\\">')) {
      return ckeditorCssText;
    }
    return line;
  })
  .join(' ');

fs.writeFileSync(outputPath, 'module.exports = "' + htmlText + '";\n');
