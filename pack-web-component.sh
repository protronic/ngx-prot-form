#!/bin/bash

dist="./dist/apps/"
app="$1"
appdist="$dist$app/"
target="$appdist$app-webcomponent.js"

echo "app: $1"
echo $dist
echo $app
echo $appdist
echo $target

function package(){
  echo "Beginne das Packen."
  rm -f "$target"
  cat "$appdist{runtime-es2015,polyfills-es2015,scripts,main-es2015}.js" > "$target"
}

if [ "${dist}${app}" != "${dist}" ]
    then
      npm run build --prod --optimization --output-hashing=none -- $app 
      package
    else 
      # npm run affected:build --prod --optimization --output-hashing=none --
      for f in $appdist*; do
        echo "f: $f"
        filename=$(echo $f | grep -oP '.*//}\K\w+$')
        echo "filename: $filename"
        target="$appdist"
        echo "target: $target"
        package
      done
fi


echo "$target"
echo "Programm abgeschlossen."
sleep 100