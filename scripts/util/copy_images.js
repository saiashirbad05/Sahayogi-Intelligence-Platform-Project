const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\saias\\Downloads';
const destDir = path.join(__dirname, '..', '..', 'public', 'gallery');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir)
  .filter(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
  .map(f => {
    try {
      return { name: f, time: fs.statSync(path.join(srcDir, f)).mtime.getTime() };
    } catch(e) { return { name: f, time: 0 }; }
  })
  .sort((a, b) => b.time - a.time)
  .slice(0, 6);

files.forEach((file, index) => {
  const ext = path.extname(file.name);
  const destName = `user-pic-${index + 1}${ext}`;
  fs.copyFileSync(path.join(srcDir, file.name), path.join(destDir, destName));
  console.log(`/gallery/${destName}`);
});
