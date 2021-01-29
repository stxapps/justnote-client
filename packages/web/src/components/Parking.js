import React from 'react';

import logoFull from '../images/logo-full.svg';

const Parking = React.memo(() => {

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <img className="mx-auto h-8" src={logoFull} alt="Justnote" />
    </div>
  );
});

export default Parking;
