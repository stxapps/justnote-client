import userSession from '../userSession';
import {
  NOTES, IMAGES, SETTINGS, INDEX, DOT_JSON, N_NOTES, MAX_TRY,
} from '../types/const';

const listFPaths = async () => {

  const noteFPaths = [];
  const staticFPaths = [];
  let settingsFPath = null;

  await userSession.listFiles((fpath) => {
    if (fpath.startsWith(NOTES)) {
      noteFPaths.push(fpath);
    } else if (fpath.startsWith(IMAGES)) {
      staticFPaths.push(fpath);
    } else if (fpath.startsWith(SETTINGS)) {
      if (!settingsFPath) settingsFPath = fpath;
      else {
        const dt = parseInt(
          settingsFPath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10
        );
        const _dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
        if (dt < _dt) settingsFPath = fpath;
      }
    } else {
      console.log(`Invalid file path: ${fpath}`);
    }

    return true;
  });

  return { noteFPaths, staticFPaths, settingsFPath };
};

const batchGetFileWithRetry = async (fpaths, callCount) => {

  const responses = await Promise.all(
    fpaths.map(fpath =>
      userSession.getFile(fpath)
        .then(content => ({ content, fpath, success: true }))
        .catch(error => ({ error, fpath, success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(failedFPaths, callCount + 1)),
    ];
  }

  return responses;
};

const batchPutFileWithRetry = async (fpaths, contents, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath, i) =>
      userSession.putFile(fpath, contents[i])
        .then(publicUrl => ({ publicUrl, fpath, success: true }))
        .catch(error => ({ error, fpath, content: contents[i], success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);
  const failedContents = failedResponses.map(({ content }) => content);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchPutFileWithRetry(failedFPaths, failedContents, callCount + 1)),
    ];
  }

  return responses;
};

export const batchDeleteFileWithRetry = async (fpaths, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath) =>
      userSession.deleteFile(fpath)
        .then(() => ({ fpath, success: true }))
        .catch(error => {
          if (error.message &&
            (error.message.includes('does_not_exist') ||
              error.message.includes('file_not_found'))) {
            return { fpath, success: true };
          }
          return { error, fpath, success: false };
        })
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchDeleteFileWithRetry(failedFPaths, callCount + 1)),
    ];
  }

  return responses;
};

const getFiles = async (fpaths) => {

  const responses = [];
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _responses = await batchGetFileWithRetry(_fpaths, 0);
    responses.push(..._responses.map((response, k) => {
      let content = response.content;
      if (_fpaths[k].endsWith(INDEX + DOT_JSON) || _fpaths[k].startsWith(SETTINGS)) {
        content = JSON.parse(content);
      }
      return content;
    }));
  }

  return responses;
};

const putFiles = async (fpaths, contents) => {

  const responses = [];
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _contents = contents.slice(i, i + N_NOTES).map((content, k) => {
      if (_fpaths[k].endsWith(INDEX + DOT_JSON) || _fpaths[k].startsWith(SETTINGS)) {
        content = JSON.stringify(content);
      }
      return content;
    });
    const _responses = await batchPutFileWithRetry(_fpaths, _contents, 0);
    responses.push(..._responses.map(response => response.publicUrl));
  }

  return responses;
};

const deleteFiles = async (fpaths) => {

  const responses = [];
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _responses = await batchDeleteFileWithRetry(_fpaths, 0);
    responses.push(..._responses.map(response => response.success));
  }

  return responses;
};

const server = { listFPaths, getFiles, putFiles, deleteFiles };

export default server;
