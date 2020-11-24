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
import Files from "./files";
import { FileModal } from "./dashboard";
const { Text, Title } = Typography;

const FolderDetail = ({ match }) => {
  const [visiblefile, setVisiblefile] = useState(false);
  const [folderList, setFolderList] = useState([]);
  const [fullfolderList, setfullFolderList] = useState([]);
  const [defaultFolder, setdefaultFolder] = useState({});
  const [id, setId] = useState(match.params.id);
  const [files, setFiles] = useState([]);
  const [foldername, setFolderName] = useState("");

  const showModalfile = () => {
    setVisiblefile(true);
  };

  const fetchFolder = async () => {
    const payload = {
      folderId: id,
    };
    const res = await userInstance().post("/getfolder", payload);
    const { code, msg, data } = res.data;
    if (code === 200) {
      if (data.length) {
        setFiles([...data[0].folder[0].files]);
        setFolderName(data[0].folder[0].foldername);
      }
    } else {
      notification["error"]({
        message: "Oops!",
        description: msg,
      });
    }
  };

  const fetchFolderList = async () => {
    const res = await userInstance().get("/getfolderlist");
    const { code, msg, data } = res.data;
    if (code === 200) {
      setfullFolderList([...data.folder]);
      let list = data.folder.filter((e) => e.isdefault !== true);
      const defaultf = data.folder.filter((e) => e.isdefault === true);
      setdefaultFolder({ ...defaultf[0] });
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
    fetchFolder();
  }, []);

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}></Breadcrumb>
      <div className="site-layout-content">
        <Link to="/dashboard">Back</Link>
        <Button
          type="primary"
          onClick={showModalfile}
          style={{ marginLeft: "10px", float: "right" }}
        >
          Add New File
        </Button>
        <Title level={3} style={{ textAlign: "center" }}>
          Folder Name - {foldername}
        </Title>
        <Files
          filelist={files}
          folders={fullfolderList}
          fetchFolderList={fetchFolder}
        />
        <FileModal
          visiblefile={visiblefile}
          setVisiblefile={setVisiblefile}
          fetchFolderList={fetchFolder}
          folderList={folderList}
          defaultFolder={defaultFolder}
          defaultselect={id}
        />
      </div>
    </>
  );
};

export default FolderDetail;
