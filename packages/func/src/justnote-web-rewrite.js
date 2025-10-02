/**
 * This function is for a viewer request event trigger.
 * Choose viewer request for event trigger
 *   when you associate this function with a distribution.
 * 1. Redirects www to non-www.
 * 2. Pass through the root path.
 * 3. Redirects paths with a trailing slash to the non-slash version.
 * 4. Passes through paths where the last part contains a dot:
 *    - This handles /favicon.ico, /js/ckeditor.js, etc.
 * 5. Appends .html to paths where the last part has no dot, e.g., /support.
 *
 * @param {AWSCloudFrontFunction.Event} event - The CloudFront event object.
 * @returns {AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response}
 */
function handler(event) {
  const request = event.request;
  const host = request.headers.host.value;
  const uri = request.uri;

  // 1. Redirect www to non-www.
  if (host.startsWith('www.')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: `https://${host.slice(4)}${uri}` },
      },
    };
  }

  // 2. Pass through the root path.
  if (uri === '' || uri === '/') return request;

  // 3. Redirects paths with a trailing slash to the non-slash version.
  if (uri.endsWith('/')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) },
      },
    };
  }

  // 4. Pass through paths where the last part contains a dot.
  if (uri.split('/').pop().includes('.')) return request;

  // 5. Append .html to no dot in the last part.
  request.uri += '.html';
  return request;
}
