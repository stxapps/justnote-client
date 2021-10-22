import React from 'react';
import { useSelector } from 'react-redux';

const SettingsPopupAccount = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const username = useSelector(state => state.user.username);
  const userImageUrl = useSelector(state => state.user.image);

  let userImage;
  if (userImageUrl) {
    userImage = (
      <img className="mx-auto w-24 h-24 border-2 border-gray-200 rounded-full overflow-hidden md:ml-auto md:mr-0" src={userImageUrl} alt="User" />
    );
  } else {
    userImage = (
      <svg className="mx-auto w-24 h-24 md:ml-auto md:mr-0" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="48" fill="#E2E8F0" />
        <path d="M82.5302 81.3416C73.8015 90.3795 61.5571 96 47.9999 96C34.9627 96 23.1394 90.8024 14.4893 82.3663C18.2913 78.3397 22.7793 74.9996 27.7572 72.5098C34.3562 69.2093 41.6342 67.4938 49.0126 67.5C62.0922 67.5 73.9409 72.7881 82.5302 81.3416Z" fill="#A0AEC0" />
        <path d="M57.9629 57.4535C60.3384 55.0781 61.6729 51.8562 61.6729 48.4968C61.6729 45.1374 60.3384 41.9156 57.9629 39.5401C55.5875 37.1647 52.3656 35.8302 49.0062 35.8302C45.6468 35.8302 42.425 37.1647 40.0495 39.5401C37.6741 41.9156 36.3396 45.1374 36.3396 48.4968C36.3396 51.8562 37.6741 55.0781 40.0495 57.4535C42.425 59.829 45.6468 61.1635 49.0062 61.1635C52.3656 61.1635 55.5875 59.829 57.9629 57.4535Z" fill="#A0AEC0" />
      </svg>
    );
  }

  return (
    <div className="p-4 md:p-6 md:pt-4">
      <div className="border-b border-gray-200 md:hidden">
        <button onClick={onSidebarOpenBtnClick} className="pb-1 group focus:outline-none">
          <span className="text-sm text-gray-500 rounded-sm group-focus:ring-2 group-focus:ring-gray-400">{'<'} <span className="group-hover:underline">Settings</span></span>
        </button>
        <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Account</h3>
      </div>
      <p className="mt-4 text-base text-gray-500 leading-relaxed md:mt-0">You sign in to Justnote using your Stacks Identity. This is similar to some websites that allow you to use your Google, Facebook, or Twitter account to sign in to their websites. Not similarly, your Stacks Identity lives in blockchain and only you with your secret key can control it. If you want to change your Stacks Identity’s information i.e. your profile picture, please visit <a className="underline rounded-sm hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400" href="https://browser.blockstack.org/profiles" target="_blank" rel="noreferrer">Blockstack Browser</a>.</p>
      <div className="mt-8 md:flow-root">
        <div className="md:float-right md:w-3/12">
          {userImage}
        </div>
        <table className="mt-4 table-auto md:mt-0 lg:table-fixed">
          <tbody>
            <tr className="py-4">
              <td className="align-middle lg:w-4/12">
                <p className="text-sm text-gray-500 text-right">ID:</p>
              </td>
              <td className="pl-2 align-baseline lg:w-8/12">
                <p className="text-base text-gray-500 leading-relaxed break-all">{username || 'N/A'}</p>
              </td>
            </tr>
            <tr className="py-4">
              <td className="align-baseline">
                <p className="text-sm text-gray-500 text-right">Password:</p>
              </td>
              <td className="pl-2 align-baseline">
                <p className="text-base text-gray-500 leading-relaxed">Unlike traditional systems, your password cannot be reset. Your password is a 12-word secret key. It's only known to you. If you lose it, there is no way to retrieve it back. Keep it safe before you sign out. You can view it only when you sign in.</p>
                <p className="pt-2 text-base text-blue-500 leading-relaxed underline hover:text-blue-700"><a className="rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400" href="https://app.blockstack.org/#/settings/secret-key" target="_blank" rel="noreferrer">View your 12-word secret key</a></p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 p-4 rounded-md bg-yellow-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-7 w-7 text-yellow-400 md:h-10 md:w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-base font-normal text-yellow-700 leading-relaxed">Signing out from Justnote doesn’t sign out from Stacks. If you want to sign out from Stacks, especially when you use not-your-own devices, you need to go to <a className="underline rounded-sm hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600" href="https://app.blockstack.org/" target="_blank" rel="noreferrer">Stacks App</a> and/or <a className="underline rounded-sm hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600" href="https://browser.blockstack.org/account/delete" target="_blank" rel="noreferrer">Blockstack Browser</a> and sign out there.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 mb-4">
        <h4 className="text-base text-red-600 font-medium leading-none">Delete Account</h4>
        <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Justnote uses Stacks Identity to sign you in. If you want to delete your Stacks Identity, please send an email to support@blockstack.com. For more information, please visit <a className="underline rounded-sm hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400" href="https://forum.stacks.org/t/is-blockstack-gdrp-compliant/10931/4" target="_blank" rel="noreferrer">here</a>.</p>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupAccount);
