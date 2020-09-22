const { execSync } = require('child_process')
const fs = require('fs')

const fetch = require('node-fetch')

const markdownIt = require('markdown-it')
const markdownItMeta = require('markdown-it-meta')

const filePath = process.argv[2]

const host = 'https://ria.microcms.io/api/v1'

const headers = {
  'X-WRITE-API-KEY': process.env.X_WRITE_API_KEY,
  'X-API-KEY': process.env.X_API_KEY,
  'Content-Type': 'application/json',
}

const fetchTagIds = async (articleTags) => {
  const fetchTagList = async () => {
    const response = await fetch(`${host}/tag`, {
      headers,
    })
    const data = await response.json()

    return data.contents.map((tag) => ({ id: tag.id, name: tag.name }))
  }

  const postNewTag = async (tagName) => {
    const response = await fetch(`${host}/tag`, {
      headers,
      method: 'post',
      body: JSON.stringify({ name: tagName }),
    })
    const data = await response.json()

    return data.id
  }

  const tagList = await fetchTagList()

  return await Promise.all(
    articleTags.map(async (tagName) => {
      // すでに存在すれば id を返す
      const TagId = tagList.find((tag) => tag.name === tagName).id
      if (TagId) return TagId

      // 存在しなければ新しく作成して id を返す
      const newTagId = await postNewTag(tagName)
      return newTagId
    })
  )
}

const main = async (filePath) => {
  console.log(filePath)

  fs.readFile(filePath, 'utf-8', async (err, article) => {
    if (err) throw err

    md = new markdownIt().use(markdownItMeta)
    md.render(article)
    const { meta } = md

    // 下書きなら return
    if (!meta.published) return

    const tags = await fetchTagIds(meta.topics)

    const json = {
      title: meta.title,
      description: meta.description,
      tags,
      markdown: article,
    }

    const id = filePath.match(/\.\.\/articles\/(.+)\.md/)[1]

    // 記事が存在すれば patch で更新、存在しなければ put で保存
    const response = await fetch(`${host}/article/${id}`, { headers })
    const exists = !!await response.json()
    const method = exists ? 'patch' : 'put'

    await fetch(`${host}/article/${id}`, {
      headers,
      method,
      body: JSON.stringify(json),
    })

    console.log(method ? 'updated' : 'created')
  })
}
main(filePath)
