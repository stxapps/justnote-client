import React from 'react';

import { useTailwind } from '.';

const SettingsPopupAccount = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const tailwind = useTailwind();

  return (
    <div className={tailwind('p-4 md:p-6')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
          <span className={tailwind('rounded-sm text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Account</h3>
      </div>
      <div className={tailwind('mt-6 md:mt-0')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Stacks Account</h4>
        <p className={tailwind('mt-3.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Your account is <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://docs.stacks.co/stacks-101/accounts" target="_blank" rel="noreferrer">a Stacks account</a>, and a Stacks account is used to access <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://explorer.hiro.so" target="_blank" rel="noreferrer">the Stacks blockchain</a> and <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://docs.stacks.co/stacks-in-depth/gaia" target="_blank" rel="noreferrer">a Stacks data server</a>. The Stacks blockchain stores your account information, such as your username, profile, and data server location. A Stacks data server stores your encrypted app data, such as all your saved notes.</p>
        <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Your Secret Key acts like a password. It's only known to you, ensuring that only you can decrypt your data and see the content inside. If you lose it, there is no way to retrieve it back. You need to keep it safe.</p>
        <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Your Secret Key cannot be changed or reset. As it's used to encrypt your content file by file, if you change your Secret Key, every file needs to be decrypted with your old Secret Key and encrypted again with your new Secret Key.</p>
      </div>
      <div className={tailwind('mt-8 mb-4')}>
        <h4 className={tailwind('text-base font-medium leading-none text-red-600 blk:text-red-500')}>Delete Account</h4>
        <p className={tailwind('mt-3.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>No one without your Secret Key can access your account or content, so you don't need to delete them. To delete all your data, please go to Settings &rarr; Data &rarr; Delete All Data.</p>
        <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Your Stacks account is generated by a cryptographic algorithm and your Secret Key. Forgetting your Secret Key is the only way to delete your account.</p>
        <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>If you've started with us, we create your Stacks account without a username, profile, or data server location. So, no data is stored in the Stacks blockchain, and your data is stored in our provided server by default.</p>
        <p className={tailwind('mt-4 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>After you delete all your data in Settings &rarr; Data &rarr; Delete All Data, there's nothing left. You can forget your Secret Key. It's permanently deleting your account.</p>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupAccount);
