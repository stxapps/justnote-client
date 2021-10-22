import React, { useEffect } from 'react';

import TopBar from './TopBar';
import Footer from './Footer';

const About = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <React.Fragment>
      <div className="pt-6">
        <TopBar />
        <div className="relative py-16 overflow-hidden">
          <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
            <div className="relative h-full text-lg max-w-prose mx-auto" aria-hidden="true">
              <svg className="absolute top-12 left-full transform translate-x-32" width="404" height="384" fill="none" viewBox="0 0 404 384">
                <defs>
                  <pattern id="74b3fd99-0a6f-4271-bef2-e80eeafdf357" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)" />
              </svg>
              <svg className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32" width="404" height="384" fill="none" viewBox="0 0 404 384">
                <defs>
                  <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
              </svg>
              <svg className="absolute bottom-12 left-full transform translate-x-32" width="404" height="384" fill="none" viewBox="0 0 404 384">
                <defs>
                  <pattern id="d3eb07ae-5182-43e6-857d-35c643af9034" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)" />
              </svg>
            </div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <div className="max-w-prose mx-auto">
              <h1 className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">About Us</h1>
            </div>
            <div className="mt-12 prose text-gray-500 mx-auto">
              <p>Justnote is a service to help people take notes. We provide a simple, easy and convenient way of taking notes on any devices. Users can take a note on our website or our mobile app which is available on both Android and iOS. Our WYSIWYG rich text editor is world class with features like bold, underline, font color, and background color. All notes are synced across user's devices automatically. Our goal is to provide our users the best experience. We're inspired by <a href="https://evernote.com/" target="_blank" rel="noreferrer">Evernote</a>, <a href="https://keep.google.com" target="_blank" rel="noreferrer">Google Keep</a>, <a href="https://joplinapp.org/" target="_blank" rel="noreferrer">Joplin</a>, <a href="https://www.notion.so/" target="_blank" rel="noreferrer">Notion</a>, and many more.</p>
              <p>Privacy is at our heart. That's why we choose <a href="https://www.stacks.co/" target="_blank" rel="noreferrer">Stacks</a>. Stacks provides tools and libraries for building an app that respects our users' privacy. User identities live in blockchain securely and cannot be locked, banned, or deleted by Justnote or anyone. All notes at Justnote are encrypted, no one can see their content. Even Justnote cannot see notes users save. Also, users can setup their own server to save their notes if they want.</p>
              <p>Justnote is open sourced and published at <a href="https://github.com/justnotecc" target="_blank" rel="noreferrer">Github.com</a>. It's built with many tools and libraries. The list is not exhausive and continue to grow: <a href="https://reactjs.org/" target="_blank" rel="noreferrer">React</a>, <a href="https://create-react-app.dev/" target="_blank" rel="noreferrer">Create React App</a>, <a href="https://react-redux.js.org/" target="_blank" rel="noreferrer">React Redux</a>, <a href="https://redux.js.org" target="_blank" rel="noreferrer">Redux</a>, <a href="https://github.com/reduxjs/redux-thunk" target="_blank" rel="noreferrer">Redux Thunk</a>, <a href="https://redux-loop.js.org/" target="_blank" rel="noreferrer">Redux Loop</a>, <a href="https://reactnative.dev/" target="_blank" rel="noreferrer">React Native</a>, <a href="https://www.framer.com/motion/" target="_blank" rel="noreferrer">Framer Motion</a>, and <a href="https://ckeditor.com/" target="_blank" rel="noreferrer">CKEditor</a>. Justnote cannot go this far without these tools and libraries. Really appreciate.</p>
              <p>We know that design is very important. Our user interface needs to be slick, intuitive, and beautiful. We use <a href="https://www.figma.com/" target="_blank" rel="noreferrer">Figma</a> to design and <a href="https://tailwindui.com/" target="_blank" rel="noreferrer">TailwindUI</a> to style. Many icons and illustrations are from <a href="https://www.heroicons.com/" target="_blank" rel="noreferrer">Heroicons</a>, <a href="https://iconmonstr.com/" target="_blank" rel="noreferrer">iconmonstr</a>, <a href="https://undraw.co/" target="_blank" rel="noreferrer">unDraw.co</a>, <a href="https://loading.io/" target="_blank" rel="noreferrer">Loading.io</a>, and <a href="https://connoratherton.com/loaders" target="_blank" rel="noreferrer">Loaders.css</a>. We learn a lot from Adam Wathan's <a href="https://www.youtube.com/channel/UCy1H38XrN7hi7wHSClfXPqQ" target="_blank" rel="noreferrer">youtube channel</a> and <a href="https://refactoringui.com/" target="_blank" rel="noreferrer">RefactoringUI book</a> from Steve Schoger. We'd like to thank all of them very much.</p>
              <p>Currently, Justnote is free. In the future, we plan to have a subscription plan for a couple of dollars per year. We believe if our service is useful, our users will support us. We wouldn't force it in any way. If users aren't ready, they will always be able to close the popup and continue using.</p>
              <p>Justnote Team<br /><a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#106;&#117;&#115;&#116;&#110;&#111;&#116;&#101;&#46;&#99;&#99;"><span className="e-mail" data-user="troppus" data-website="cc.etontsuj"></span></a></p>
            </div>
            <div className="pt-12 max-w-prose mx-auto text-right text-gray-500">
              <button className="group rounded-sm hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400" onClick={() => window.scrollTo(0, 0)}>
                <span className="pl-1">Back to top</span>
                <svg className="mb-1 ml-1 inline-block w-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.29289 9.70711C2.90237 9.31658 2.90237 8.68342 3.29289 8.29289L9.29289 2.29289C9.68342 1.90237 10.3166 1.90237 10.7071 2.29289L16.7071 8.29289C17.0976 8.68342 17.0976 9.31658 16.7071 9.70711C16.3166 10.0976 15.6834 10.0976 15.2929 9.70711L11 5.41421V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V5.41421L4.70711 9.70711C4.31658 10.0976 3.68342 10.0976 3.29289 9.70711Z" />
                </svg>
              </button>
              <br />
              <a className="mt-2 inline-block group rounded-sm hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400" href="/">
                <span className="pl-0.5">Go home</span>
                <svg className="mb-1 ml-1 inline-block w-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.7071 2.29289C10.3166 1.90237 9.68342 1.90237 9.29289 2.29289L2.29289 9.29289C1.90237 9.68342 1.90237 10.3166 2.29289 10.7071C2.68342 11.0976 3.31658 11.0976 3.70711 10.7071L4 10.4142V17C4 17.5523 4.44772 18 5 18H7C7.55228 18 8 17.5523 8 17V15C8 14.4477 8.44772 14 9 14H11C11.5523 14 12 14.4477 12 15V17C12 17.5523 12.4477 18 13 18H15C15.5523 18 16 17.5523 16 17V10.4142L16.2929 10.7071C16.6834 11.0976 17.3166 11.0976 17.7071 10.7071C18.0976 10.3166 18.0976 9.68342 17.7071 9.29289L10.7071 2.29289Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
};

export default React.memo(About);
