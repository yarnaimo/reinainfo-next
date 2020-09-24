#!/bin/sh

sed -i -e \
 's#type BlueValue = string#type BlueValue = Blue.IO<any, any> | string#' \
 node_modules/bluespark/dist/blue-types.d.ts

sed -i -e \
 's#_ref: undefined,#_ref: null,#' \
 node_modules/bluespark/dist/utils/doc.js
