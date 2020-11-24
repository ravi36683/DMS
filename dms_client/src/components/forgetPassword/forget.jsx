import React, { useEffect,useState } from "react";
import "./forget.css";
import { Form, Input, Button, notification } from "antd";
import { Link } from "react-router-dom";
import { userInstance } from "../../config/axios";
import queryString from 'query-string';
import Reset from './reset'


const Forget = ({history}) => {
  const [id, setId] = useState(null);

  const getData = async () => {
    const value = queryString.parse(window.location.search);
    const idd = value.hh;
    if (idd) {
      setId(idd);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { email } = values;
    const payload = {
      email,
    };
    const res = await userInstance().post("/resetpassword", payload);
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
    <>
    {!id?(<div className="login">
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
    </div>):<Reset id = {id} history={history}/>}
    </>
  );
};

export default Forget;
