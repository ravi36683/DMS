import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Tooltip,
  Button,
  Modal,
  Form,
  Input,
  notification,
  Select,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { server } from "../../config/keys";
import { userInstance } from "../../config/axios";
const { Option } = Select;

const { Text } = Typography;

const Files = ({ filelist, folders, fetchFolderList }) => {
  const [visible, setVisible] = useState(false);
  const [fileData,setFileData] = useState(null);
  const showModal = (data) => {
    setVisible(true);
    setFileData(data);
  };
  const openInNewTab = (url) => {
    var win = window.open(url, "_blank");
    win.focus();
  };

  return (
    <>
      <div className="file-container">
        <Row>
          {filelist.map((e, i) => {
            return (
              <Tooltip placement="top" title={e.docDesc} key={i}>
                <Col span={4}>
                  <div className="folder-item">
                    <Row>
                      <Col span={24}>
                        <FileTextOutlined style={{ fontSize: "72px" }} />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Text strong>{e.docName}</Text>
                      </Col>
                      <Col span={12}>
                        <Button
                          onClick={() => openInNewTab(server + "/" + e.file)}
                        >
                          Open
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button onClick={()=>showModal(e)}>Move</Button>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Tooltip>
            );
          })}
        </Row>
      </div>
      <MoveModal
        visible={visible}
        setVisible={setVisible}
        fetchFolderList={fetchFolderList}
        folderList={folders}
        fileData = {fileData}
        setFileData={setFileData}
      />
    </>
  );
};

export default Files;

const MoveModal = ({ visible, setVisible, fetchFolderList, folderList,fileData,setFileData }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    setVisible(false);
    setFileData(null);
  };

  const moveFile = async () => {
    const isValid = await form.validateFields();
    if (isValid) {
      setConfirmLoading(true);
      let newfolder = form.getFieldValue("newfolder");
      const payload = {
        newfolder,
        oldfolder:fileData.folder,
        fileid:fileData._id
      };

      const res = await userInstance().post("/movefile", payload);
      const { code, msg } = res.data;
      if (code === 200) {
        form.resetFields();
        setVisible(false);
        setConfirmLoading(false);
        setFileData(null);
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
      title="Move File"
      visible={visible}
      onOk={moveFile}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={confirmLoading}
          onClick={moveFile}
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
          <Form.Item label='Move to' name="newfolder">
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
        </Form>
      </p>
    </Modal>
  );
};
