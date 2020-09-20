# Zenn Contents

👇How to use
https://zenn.dev/zenn/articles/zenn-cli-guide

CMS Publish
cd cms
for md in $( git diff HEAD --name-only | grep .md$ ); do
   yarn post-publish ../${md}
done
