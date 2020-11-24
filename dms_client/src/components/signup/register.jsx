import React, { useEffect, useState } from "react";
import "./register.css";
import {
  Form,
  Input,
  Row,
  Col,
  Checkbox,
  Button,
  notification
} from "antd";
import { Link } from "react-router-dom";
import {userInstance} from '../../config/axios'


const Register = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const {name,email,password,agreement} = values
    const payload = {
      name,
      email,
      password,
      tnc:agreement
    }
    const saveData = await userInstance().post('/signup', payload);
    const { code, msg } = saveData.data;
    if (code === 200) {
      notification['success']({
        message: 'Congrats!',
        description:msg,
      });
      form.resetFields();
    } else {
      notification['error']({
        message: 'Oops!',
        description:msg,
      });
    }

  };


  return (
    <div className="register">
      {/* <Toaster /> */}
      <div className="register-section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="register-form">
                <h1>Register</h1>
                <p>We're happy to have you here!</p>
                <div className="register-box">
                  <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    initialValues={{
                      residence: ["zhejiang", "hangzhou", "xihu"],
                      prefix: "86",
                    }}
                    scrollToFirstError
                  >
                    <Row gutter={[16, 0]}>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label="E-mail"
                          rules={[
                            {
                              type: "email",
                              message: "The input is not valid E-mail!",
                            },
                            {
                              required: true,
                              message: "Please input your E-mail!",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="name"
                          rules={[
                            {
                              required: true,
                              message: "Please input your name!",
                              whitespace: true,
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                      <Col span={12}>
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
                      </Col>

                      <Col span={12}>
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
                                if (
                                  !value ||
                                  getFieldValue("password") === value
                                ) {
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
                      </Col>
                    </Row>

                    <Row>
                      <Col span={24}>
                        <Form.Item name="agreement" valuePropName="checked" rules={[
                            {
                              required: true,
                              message: "Please accept terms & conditions.",
                            },
                            
                          ]}>
                          <Checkbox>
                            I have read the <Link to={"/"}>agreement</Link>
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={24}>
                        <Form.Item>
                          <Button
                            type="primary"
                            className="register-btn"
                            htmlType="submit"
                          >
                            Register
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </div>

              <div className="q-links">
                <p>
                  Already have an account? <Link to="/">Login now</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
