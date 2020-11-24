import React, { useEffect } from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { Layout, Menu, Button, Row, Col } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
const { Header } = Layout;

const TopHeader = ({setIsAuth}) => {

  const logout=async()=>{
    localStorage.removeItem('usertoken');
    setIsAuth(false);
  }
  return (
    <Header>
      <Row>
        <Col span={20}>
          <div className="logo">
            <h2>Document Management System</h2>
          </div>
        </Col>
        <Col span={4}>
          <div className="logout">
            <Button type="primary" icon={<LogoutOutlined />} size="large" onClick={logout} />
          </div>
        </Col>
      </Row>

      {/* <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
        <Menu.Item key="1">nav 1</Menu.Item>
        <Menu.Item key="2">nav 2</Menu.Item>
        <Menu.Item key="3">nav 3</Menu.Item>
      </Menu> */}
    </Header>
  );
};

export default TopHeader;
