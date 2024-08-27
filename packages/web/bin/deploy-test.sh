#!/bin/bash

aws s3 sync build/static s3://test-justnote-web/static --size-only --delete --acl public-read --cache-control max-age=31536000 --profile justnote

aws s3 sync build/.well-known s3://test-justnote-web/.well-known --size-only --delete --acl public-read --content-type application/json --profile justnote
#aws s3 cp build/.well-known/apple-app-site-association s3://test-justnote-web/.well-known/apple-app-site-association --acl public-read --content-type application/json --profile justnote

# stackoverflow.com/questions/55045423/aws-cli-s3-sync-how-to-exclude-multiple-files
cachedItems=(logo16.png logo32.png logo48.png logo64.png logo192.png logo192-maskable.png logo512.png logo512-maskable.png logo-for-stacks-access.png ss-mobile-1.png ss-mobile-2.png ss-mobile-3.png ss-mobile-4.png ss-mobile-5.png ss-mobile-6.png ss-mobile-7.png ss-wide-1.png ss-wide-2.png ss-wide-3.png ss-wide-4.png ss-wide-5.png ss-wide-6.png ss-wide-7.png twitter-card-image-pattern1.png)
aws s3 sync build s3://test-justnote-web --exclude "*" "${cachedItems[@]/#/--include=}" --size-only --delete --acl public-read --cache-control max-age=604800 --profile justnote

aws s3 sync build s3://test-justnote-web --exclude "static/*" --exclude ".well-known/*" "${cachedItems[@]/#/--exclude=}" --exclude service-worker.js --exclude index.html --size-only --delete --acl public-read --profile justnote

aws s3 cp build/service-worker.js s3://test-justnote-web/service-worker.js --acl public-read --cache-control no-cache --profile justnote
aws s3 cp build/index.html s3://test-justnote-web/index.html --acl public-read --cache-control no-cache --profile justnote

aws cloudfront create-invalidation --distribution-id E16T92AA3CQF3P --paths /index.html --profile justnote
#aws cloudfront create-invalidation --distribution-id E16T92AA3CQF3P --paths /index.html "/.well-known/*" --profile justnote
