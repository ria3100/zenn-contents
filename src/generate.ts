import * as fs from 'fs';
import markdownIt from 'markdown-it';
const markdownItMeta = require('markdown-it-meta');

interface Meta {
  title: string;
  description: string;
  emoji: string;
  topics: string[];
  published: true;
}

interface Data extends Omit<Meta, 'published'> {
  path: string;
}

const main = () => {
  const paths = fs
    .readdirSync('./articles')
    .filter(file => /.*\.md$/.test(file));

  const data = paths.reduce((acc, path): Data[] => {
    const file = fs.readFileSync(`./articles/${path}`, 'utf-8');

    const md = new markdownIt().use(markdownItMeta);
    md.render(file);
    const {meta} = md as any as {meta: Meta};

    if (!meta.published) return acc;

    return [
      ...acc,
      {
        title: meta.title,
        description: meta.description,
        emoji: meta.emoji,
        topics: meta.topics,
        path: path.replace(/.md$/, ''),
      },
    ];
  }, [] as any);

  fs.writeFileSync('./docs/v1.json', JSON.stringify({items: data}));
};

main();
