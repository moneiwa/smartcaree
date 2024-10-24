import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Table, message } from "antd";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Fetch users
  const getUsers = async () => {
    try {
      const res = await axios.get("/api/v1/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Block user account
  const handleBlockUser = async (userId) => {
    try {
      const res = await axios.post(
        "/api/v1/admin/blockUser",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getUsers(); // Refresh the user list
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something went wrong while blocking the user.");
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Ant Design table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Caregiver",
      dataIndex: "isCaregiver",
      render: (text, record) => <span>{record.isCaregiver ? "Yes" : "No"}</span>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          <button
            className="btn btn-danger"
            onClick={() => handleBlockUser(record._id)}
          >
            Block
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-2">Users List</h1>
      <Table columns={columns} dataSource={users} />
    </Layout>
  );
};

export default Users;
