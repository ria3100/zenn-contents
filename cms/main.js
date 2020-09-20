const { execSync } = require('child_process')
const fs = require('fs')

const fetch = require('node-fetch')

const markdownIt = require('markdown-it')
const markdownItMeta = require('markdown-it-meta')

const filePath = process.argv[2]

const main = async (filePath) => {
  fs.readFile(filePath, 'utf-8', async (err, article) => {
    if (err) throw err

    md = new markdownIt().use(markdownItMeta)
    md.render(article)
    const { meta } = md

    const json = {
      title: meta.title,
      description: meta.description,
      tags: meta.topics.map(topic => ({
        fieldId: 'tag', name: topic,
      })),
      markdown: article,
    }

    await fetch(`https://ria.microcms.io/api/v1/article/foo`, {
      headers: {
        'X-WRITE-API-KEY': process.env.X_WRITE_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'put',
      body: JSON.stringify(json),
    })
  })
}
main(filePath)
