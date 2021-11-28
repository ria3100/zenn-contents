import * as fs from 'fs';
import markdownIt from 'markdown-it';
const markdownItMeta = require('markdown-it-meta');

const main = () => {
  const paths = fs
    .readdirSync('./articles')
    .filter(file => /.*\.md$/.test(file));

  const data = paths.map(path => {
    const file = fs.readFileSync(`./articles/${path}`, 'utf-8');

    const md = new markdownIt().use(markdownItMeta);
    md.render(file);
    const {meta} = md as any;

    return {
      path: path.replace(/.md$/, ''),
      ...meta,
    };
  });

  fs.writeFileSync('./docs/v1.json', JSON.stringify({items: data}));
};

main();
