#!/usr/bin/env sh

set -xe

# Params
if (( $# < 3 )); then
    echo "Usage: $0 <example_framework> <capture_lib_path> <license_file>";
    exit 1;
fi

# read params
example_framework=$1
capture_lib_path=$2
license_file=$3

# install license
search_string="<license_string>"
license_string=$(cat "$license_file")

if [ "$example_framework" = "vue" ]; then
  src_file="$example_framework/src/App.vue"
else
  echo "Error: Unsupported framework. Only 'vue' is supported."
  exit 1
fi

sed -i "s|$search_string|$license_string|g" "$src_file"

# run example
mkdir -p $example_framework/libs
cp $capture_lib_path $example_framework/libs/idlive-document-capture-web.tgz
npm --prefix $example_framework run install-dependencies
npm --prefix $example_framework run dev
