import React, { useEffect, useState } from "react";
import "./login.css";
import { Form, Input, Button, Checkbox, notification } from "antd";
import { Link } from "react-router-dom";
import {userInstance} from '../../config/axios'


const Login = ({ isAuth, setIsAuth }) => {
const [form] = Form.useForm();
  


  const onFinish = async(values) => {
    const {email,password} = values
    const payload = {
      email,
      password,
    }
    const saveData = await userInstance().post('/login', payload);
    const { code, msg,token } = saveData.data;
    if (code === 200) {
      form.resetFields();
      localStorage.setItem("usertoken", token);
      setIsAuth(true);

    } else {
      notification['error']({
        message: 'Oops!',
        description:msg,
      });
    }

  };

  return (
    <div className="login">
      {/* <Toaster /> */}
      <div className="login-section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="login-form">
                <h1>Sign In</h1>
                <p>We're happy to have you here again!</p>
                <div className="login-box">
                  <Form
                    form={form}
                    name="basic"
                    initialValues={{
                      remember: true,
                    }}
                    onFinish={onFinish}
                  >
                    <Form.Item
                      label="E-mail Address"
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: "The input is not valid E-mail!",
                        },
                        {
                          required: true,
                          message: "Please enter your E-mail Address!",
                        },
                      ]}
                    >
                      <Input placeholder="me@janlosert.com" />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
                    >
                      <Input.Password placeholder="******" />
                    </Form.Item>

                    <Form.Item>
                      <Button className="login-btn" htmlType="submit">
                        Sign In
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>

              <div className="q-links">
                <p>
                  Don't have an account yet?{" "}
                  <Link to={"/register"}>Register now</Link>
                </p>

                <p>
                  Forget your password?{" "}
                  <Link to={"/forgetpassword"}>Get a new password</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
