import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { Layout, Menu, Breadcrumb } from "antd";
import "./App.css";
import Login from "./components/login/login";
import Register from "./components/signup/register";
import Forget from "./components/forgetPassword/forget";
import Reset from "./components/forgetPassword/reset";
import TopHeader from "./components/header/topheader";
import Dashboard from "./components/dashboard/dashboard";
import history from "./config/history";
import Folder from "./components/dashboard/folderdetail";
import { userInstance } from "./config/axios";

const { Content, Footer } = Layout;

const App = () => {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("usertoken"));
  const validate = async () => {
    const userdata = await userInstance().get("/validateToken");
    const { code, userData } = userdata.data;
    if (code !== 200) {
      setIsAuth(false);
      localStorage.removeItem("usertoken");
    }
  };
  useEffect(() => {
    validate();
  }, [isAuth]);

  const LoginRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        localStorage.getItem("usertoken") ? (
          <Redirect to="/dashboard" />
        ) : (
          <Component {...props} {...rest} />
        )
      }
    />
  );

  const PriveteRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        localStorage.getItem("usertoken") ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );

  return (
    <div className="App">
      <div className="main-wrapper">
        <Router history={history}>
          <Layout className="layout">
            {isAuth ? <TopHeader setIsAuth={setIsAuth} /> : ""}
            <Content style={{ padding: "0 50px" }}>
              <LoginRoute
                exact
                path="/"
                component={() => (
                  <Login isAuth={isAuth} setIsAuth={setIsAuth} />
                )}
              />
              <LoginRoute
                exact
                path="/register"
                component={() => <Register />}
              />
              <LoginRoute
                exact
                path="/forgetpassword"
                component={() => <Forget />}
              />
              <PriveteRoute
                exact
                path="/dashboard"
                component={() => <Dashboard />}
              />
              <PriveteRoute
                exact
                path="/folder/:id"
                component={(props) => <Folder {...props} />}
              />
            </Content>
          </Layout>
        </Router>
      </div>
    </div>
  );
};

export default App;
