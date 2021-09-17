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

const batchGetFileWithRetry = async (
  fpaths, callCount, dangerouslyIgnoreError = false
) => {

  const responses = await Promise.all(
    fpaths.map(fpath =>
      userSession.getFile(fpath)
        .then(content => ({ content, fpath, success: true }))
        .catch(error => ({ content: null, fpath, success: false, error }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) {
      if (dangerouslyIgnoreError) return responses;
      throw failedResponses[0].error;
    }

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(
        failedFPaths, callCount + 1, dangerouslyIgnoreError
      )),
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
          // BUG ALERT
          // Treat not found error as not an error as local data might be out-dated.
          //   i.e. user tries to delete a not-existing file, it's ok.
          // Anyway, if the file should be there, this will hide the real error!
          if (error.message &&
            (error.message.includes('failed to delete') &&
              error.message.includes('404'))) {
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

const getFiles = async (_fpaths, dangerouslyIgnoreError = false) => {

  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let i = 0, j = _fpaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = _fpaths.slice(i, i + N_NOTES);
    const responses = await batchGetFileWithRetry(
      selectedFPaths, 0, dangerouslyIgnoreError
    );
    fpaths.push(...responses.map(({ fpath }) => fpath));
    contents.push(...responses.map(({ fpath, content }) => {
      if (fpath.endsWith(INDEX + DOT_JSON) || fpath.startsWith(SETTINGS)) {
        content = JSON.parse(content);
      }
      return content;
    }));
  }

  return { fpaths, contents };
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _contents = contents.slice(i, i + N_NOTES).map((content, k) => {
      if (_fpaths[k].endsWith(INDEX + DOT_JSON) || _fpaths[k].startsWith(SETTINGS)) {
        content = JSON.stringify(content);
      }
      return content;
    });
    await batchPutFileWithRetry(_fpaths, _contents, 0);
  }
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    await batchDeleteFileWithRetry(_fpaths, 0);
  }
};

const server = { listFPaths, getFiles, putFiles, deleteFiles };

export default server;
