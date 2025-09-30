/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import { environmentConfig } from '../../util/environment-util';
import { useUser } from '@asgardeo/react';
import { useHttpSwitch } from '../../sdk/httpSwitch';
import { Box, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ListUsers = () => {
  const { profile } = useUser();
  const columns = [
    { field: 'id', headerName: 'ID', width: 280, sortable: false },
    { field: 'username', headerName: 'Username', width: 220 },
    { field: 'givenName', headerName: 'First Name', width: 160 },
    { field: 'familyName', headerName: 'Last Name', width: 160 },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: "assignRole",
      headerName: "Assign Role",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{params.row.role}</span>
          <IconButton
            aria-label="assign-role"
            color="secondary"
            size="small"
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
              setSelectedUser(params.row);
            }}
          >
          <EditIcon />
          </IconButton>
        </div>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          aria-label="edit"
          color="primary"
          onClick={() => setEditingRow(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: "actions",
      headerName: "Delete",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          aria-label="delete"
          color="error"
          onClick={() => handleDelete(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  function cleanUsername(rawUsername = "") {
    return rawUsername.includes("/") ? rawUsername.split("/")[1] : rawUsername;
  }

  function transformUsers(data) {
    if (!data.Resources) return [];

    return data.Resources
      .filter((user) => cleanUsername(user.userName) !== profile.userName)
      .map((user) => ({
        id: user.id,
        username: cleanUsername(user.userName),
        givenName: user.name?.givenName ?? "",
        familyName: user.name?.familyName ?? "",
        email: user.emails?.[0] ?? "",
        role: user.roles?.[0]?.display ?? "Member"
      }));
  }

  const httpSwitch = useHttpSwitch();
    useEffect(() => {
    const requestConfig = {
      headers: {
        Accept: "application/scim+json",
        "Content-Type": "application/scim+json",
      },
      method: "GET",
      url: `${environmentConfig.ASGARDEO_BASE_URL}/o/scim2/Users`,
    };

    httpSwitch
      .request(requestConfig)
      .then((response) => {
        setRows(transformUsers(response.data));
      })
      .catch((error) => {
        console.error("Error fetching SCIM users:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (userId) => {
  const requestConfig = {
    method: "DELETE",
    url: `${environmentConfig.ASGARDEO_BASE_URL}/o/scim2/Users/${userId}`,
    headers: {
      Accept: "*/*",
      "Content-Type": "application/scim+json",
    },
  };

  httpSwitch
    .request(requestConfig)
    .then(() => {
      setRows((prevRows) => prevRows.filter((row) => row.id !== userId));
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
    });
};

  const handleSave = (updatedUser) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === updatedUser.id ? updatedUser : row
      )
    );
    setEditingRow(null);
  };

const getRoleIdByName = async (roleName) => {
  const requestConfig = {
    method: "GET",
    url: `${environmentConfig.ASGARDEO_BASE_URL}/o/scim2/v2/Roles?filter=displayName eq ${encodeURIComponent(roleName)}`,
    headers: {
      Accept: "application/scim+json",
    },
  };

  try {
    const response = await httpSwitch.request(requestConfig);
    const resources = response.data?.Resources || [];
    return resources.length > 0 ? resources[0].id : null;
  } catch (error) {
    console.error("Error fetching role ID:", error);
    return null;
  }
};

const handleRoleSelect = async (newRoleName) => {
  if (!selectedUser) return;

  try {
    const currentRoleId = await getRoleIdByName(selectedUser.role);
    const newRoleId = await getRoleIdByName(newRoleName);

    if (!newRoleId) {
      console.error(`Role ID not found for role: ${newRoleName}`);
      return;
    }

    if (currentRoleId) {
      await httpSwitch.request({
        method: "PATCH",
        url: `${environmentConfig.ASGARDEO_BASE_URL}/o/scim2/v2/Roles/${currentRoleId}`,
        headers: {
          Accept: "application/scim+json",
          "Content-Type": "application/scim+json",
        },
        data: {
          schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
          Operations: [
            {
              op: "remove",
              path: `users[value eq "${selectedUser.id}"]`
            }
          ]
        }
      });
    }

    await httpSwitch.request({
      method: "PATCH",
      url: `${environmentConfig.ASGARDEO_BASE_URL}/o/scim2/v2/Roles/${newRoleId}`,
      headers: {
        Accept: "application/scim+json",
        "Content-Type": "application/scim+json",
      },
      data: {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        Operations: [
          {
            op: "add",
            path: "users",
            value: [{ value: selectedUser.id }]
          }
        ]
      }
    });

    setRows((prev) =>
      prev.map((row) =>
        row.id === selectedUser.id ? { ...row, role: newRoleName } : row
      )
    );

  } catch (error) {
    console.error("Error switching role:", error);
  } finally {
    setAnchorEl(null);
    setSelectedUser(null);
  }
};


  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingRow, setEditingRow] = React.useState(null);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const open = Boolean(anchorEl);

  const paginationModel = { page: 0, pageSize: 5 };

  if (editingRow) {
    return (
      <Paper sx={{ p: 3 }}>
        <h2>Edit User</h2>
        <Box component="form" sx={{ display: "grid", gap: 2, maxWidth: 400 }}>
          <TextField
            label="Username"
            value={editingRow.username}
            onChange={(e) =>
              setEditingRow({ ...editingRow, username: e.target.value })
            }
          />
          <TextField
            label="First Name"
            value={editingRow.givenName}
            onChange={(e) =>
              setEditingRow({ ...editingRow, givenName: e.target.value })
            }
          />
          <TextField
            label="Last Name"
            value={editingRow.familyName}
            onChange={(e) =>
              setEditingRow({ ...editingRow, familyName: e.target.value })
            }
          />
          <TextField
            label="Email"
            value={editingRow.email}
            onChange={(e) =>
              setEditingRow({ ...editingRow, email: e.target.value })
            }
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <button
              color="primary"
              className="gold-button"
              onClick={() => handleSave(editingRow)}
            >
              Save
            </button>
            <button
            onClick={() => setEditingRow(null)}>
              Back
            </button>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        sx={{ border: 0 }}
        className="user-data"
        disableColumnMenu
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleRoleSelect("Manager")}>Manager</MenuItem>
        <MenuItem onClick={() => handleRoleSelect("Member")}>Member</MenuItem>
        <MenuItem onClick={() => handleRoleSelect("Admin")}>Admin</MenuItem>
      </Menu>
    </Paper>
  );
}

export default ListUsers;
