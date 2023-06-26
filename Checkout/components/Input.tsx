import React from 'react';

export default function Input(props: any) {
  return (
    <div className="mb-6 w-full px-3 md:mb-0">
      {/*<label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"*/}
      {/*       htmlFor="grid-first-name">*/}
      {/*    First Name*/}
      {/*</label>*/}
      <input
        className="mb-3 block w-full appearance-none rounded border border-red-500 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
        id="grid-first-name"
        type="text"
        {...props}
      />
    </div>
  );
}
