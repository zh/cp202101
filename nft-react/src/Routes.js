import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Pages from './Pages';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Pages.AllNFTs} />
      <Route path="/view/:txid" component={Pages.Viewer} />
      <Route path="/create/:txid?" component={Pages.Creator} />
      <Route exact path="/groups" component={Pages.Groups} />
    </Switch>
  );
};

export default Routes;
