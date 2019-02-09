git checkout gh-pages
git pull origin gh-pages
npm remove -S jquery.bangla
npm install -S jquery.bangla
cp -r node_modules/jquery.bangla/dist .
git add --all
git commit -m "Update package"
git push origin gh-pages
