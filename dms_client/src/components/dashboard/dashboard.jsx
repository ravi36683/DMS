import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  Modal,
  Button,
  Form,
  Input,
  notification,
  Row,
  Col,
  Typography,
  Select,
  Upload,
  message,
} from "antd";
import { userInstance } from "../../config/axios";
import { FolderFilled, UploadOutlined, InboxOutlined } from "@ant-design/icons";
import Files from './files';
const { Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [visible, setVisible] = useState(false);
  const [visiblefile, setVisiblefile] = useState(false);
  const [folderList, setFolderList] = useState([]);
  const [defaultFolder, setdefaultFolder] = useState({files:[]});

  const showModal = () => {
    setVisible(true);
  };

  const showModalfile = () => {
    setVisiblefile(true);
  };

  const fetchFolderList = async () => {
    const res = await userInstance().get("/getfolderlist");
    const { code, msg, data } = res.data;
    if (code === 200) {
      let list = data.folder.filter((e) => e.isdefault !== true);
      const defaultf  = data.folder.filter((e) => e.isdefault === true);
      setdefaultFolder({...defaultf[0]});
      setFolderList([...list]);
    } else {
      notification["error"]({
        message: "Oops!",
        description: msg,
      });
    }
  };

  useEffect(() => {
    fetchFolderList();
  }, []);

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}></Breadcrumb>
      <div className="site-layout-content">
        <Button type="primary" onClick={showModal}>
          Add New Folder
        </Button>
        <Button
          type="primary"
          onClick={showModalfile}
          style={{ marginLeft: "10px" }}
        >
          Add New File
        </Button>
        <div className="item-container">
          <Row>
            {folderList.map((e, i) => {
              return (
                <Col span={4} key={i}>
                  <Link to={`/folder/${e._id}`}>
                  <div className="folder-item">
                    <Row>
                      <Col span={24}>
                        <FolderFilled style={{ fontSize: "72px" }} />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Text strong>{e.foldername}</Text>
                      </Col>
                    </Row>
                  </div>
                  </Link>
                </Col>
              );
            })}
          </Row>
        </div>
        <Files filelist={defaultFolder.files} folders = {folderList} fetchFolderList={fetchFolderList}/>
        <FolderModal
          visible={visible}
          setVisible={setVisible}
          fetchFolderList={fetchFolderList}
        />
        <FileModal
          visiblefile={visiblefile}
          setVisiblefile={setVisiblefile}
          fetchFolderList={fetchFolderList}
          folderList={folderList}
          defaultFolder={defaultFolder}
        />
      </div>
    </>
  );
};

export default Dashboard;

 const FolderModal = ({ visible, setVisible, fetchFolderList }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    setVisible(false);
  };

  const createFolder = async () => {
    const isValid = await form.validateFields();
    if (isValid) {
      setConfirmLoading(true);
      let foldername = form.getFieldValue("foldername");
      const payload = {
        foldername,
      };

      const res = await userInstance().post("/createfolder", payload);
      const { code, msg } = res.data;
      if (code === 200) {
        form.resetFields();
        setVisible(false);
        setConfirmLoading(false);
        notification["success"]({
          message: "Success!",
          description: msg,
        });
        fetchFolderList();
      } else {
        setConfirmLoading(false);
        notification["error"]({
          message: "Oops!",
          description: msg,
        });
      }
    }
  };

  return (
    <Modal
      title="Add New Folder"
      visible={visible}
      onOk={createFolder}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={confirmLoading}
          onClick={createFolder}
        >
          Submit
        </Button>,
      ]}
    >
      <p>
        <Form
          form={form}
          name="basic"
          initialValues={{
            remember: true,
          }}
        >
          <Form.Item
            label=""
            name="foldername"
            rules={[
              {
                required: true,
                message: "Please enter folder name!",
              },
            ]}
          >
            <Input placeholder="Folder name" />
          </Form.Item>
        </Form>
      </p>
    </Modal>
  );
};

export const FileModal = ({
  visiblefile,
  setVisiblefile,
  fetchFolderList,
  folderList,
  defaultFolder,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [file, setfile] = useState(null);
  const ref = React.createRef();
  const [form] = Form.useForm();

  const handleCancel = () => {
    setVisiblefile(false);
  };

  const adddoc = async (values) => {
    const isValid = await form.validateFields();
    if (isValid) {
      setConfirmLoading(true);
      let folder = form.getFieldValue("folder");
      if (typeof folder === 'undefined') {
        folder = defaultFolder._id
      }
      const data = new FormData();
      data.append("file", file);
      data.append("folder", folder );
      data.append("docName", form.getFieldValue("docname"));
      data.append("docDesc", form.getFieldValue("docdesc"));
      let imageData = null;
            
          imageData = await userInstance().post(
            "/uploaddoc",
            data
        );
      const { code, msg } = imageData.data;
      if (code === 200) {
        form.resetFields();
        setVisiblefile(false);
        setConfirmLoading(false);
        notification["success"]({
          message: "Success!",
          description: msg,
        });
        fetchFolderList();
      } else {
        setConfirmLoading(false);
        notification["error"]({
          message: "Oops!",
          description: msg,
        });
      }
    }
  };

  const uploadimg = (img) => {
    setfile(img.current.files[0]);
  };

  return (
    <Modal
      title="Add New Folder"
      visible={visiblefile}
      onOk={adddoc}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={confirmLoading}
          onClick={adddoc}
        >
          Submit
        </Button>,
      ]}
    >
      <p>
        <Form
          form={form}
          name="basic"
          initialValues={{
            remember: true,
          }}
        >
          <Form.Item name="folder">
            <Select placeholder="Select Folder">
              {folderList.map((e, i) => {
                return (
                  <Option value={e._id} key={i}>
                    {e.foldername}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label="Document Name"
            name="docname"
            rules={[
              {
                required: true,
                message: "Please enter Document name!",
              },
            ]}
          >
            <Input placeholder="Document name" />
          </Form.Item>
          <Form.Item name="docdesc">
            <Input placeholder="Document Desc" />
          </Form.Item>
          <Form.Item
            name="upload"
            label="Upload"
            valuePropName="file"
            rules={[
              {
                required: true,
                message: "Please upload a file!",
              },
            ]}
          >
            <input
              type="file"
              className="custom-file-input"
              id="inputGroupFile01"
              aria-describedby="inputGroupFileAddon01"
              onChange={uploadimg.bind(this, ref)}
              ref={ref}
            />
          </Form.Item>
        </Form>
      </p>
    </Modal>
  );
};
