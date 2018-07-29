echo '======= build ========'
npm run lint
npm run build
echo '======= checkout gh-pages ========'
cd example
git checkout gh-pages
echo '======= pull latest ========'
git stash
git pull origin gh-pages
echo '======= publish changes ========'
rm -rf dist
cp -r ../dist .
git add dist/**
git commit -m "Update dist"
git push origin gh-pages
echo '======= update master ========'
cd ..
git add example
git commit -m "Update gh-pages"
git push origin master
