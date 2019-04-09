import React from "react";
import { Router } from "@reach/router";
import AddClient from "./add-client/add-client.component";
import Navbars from "./navbar/navbars.component";
import Styleguide from "./styleguide.component";
import Home from "./home/home.component";
import ReportIssue from "./report-issue/report-issue.component";
import ReportIssueSuccess from "./report-issue/report-issue-success.component";
import UserContext from "./util/user.context";

export default function Root() {
  return (
    <UserContext>
      <Styleguide>
        <Router basepath="/">
          <Navbars path="/">
            <Home path="/" exact />
            <AddClient path="/add-client" />
            <ReportIssue path="/report-issue" exact />
            <ReportIssueSuccess path="/report-issue/:issueId" />
          </Navbars>
        </Router>
      </Styleguide>
    </UserContext>
  );
}
