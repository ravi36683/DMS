import React, { useEffect, useState } from "react";
import "./forget.css";
import { Form, Input, Button, notification } from "antd";
import { Link, useParams } from "react-router-dom";
import { userInstance } from "../../config/axios";


const Reset = ({id}) => {
  const [form] = Form.useForm();


  const onFinish = async (values) => {
    const { password } = values;
    const payload = {
      newpassword:password,
      hex:id
    };
    const res = await userInstance().post("/forgetpassword", payload);
    const { code, msg } = res.data;
    if (code === 200) {
      form.resetFields();
      notification["success"]({
        message: "Success!",
        description: msg,
      });
    } else {
      notification["error"]({
        message: "Oops!",
        description: msg,
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
                <h1>Forget Password</h1>
                {/* <p>We're happy to have you here again!</p> */}
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
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      name="confirm"
                      label="Confirm Password"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }

                            return Promise.reject(
                              "The two passwords that you entered do not match!"
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item>
                      <Button className="login-btn" htmlType="submit">
                        Submit
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>

              <div className="q-links"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reset;
