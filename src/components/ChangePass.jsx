import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Password from "./PassInput";

import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

const defaultTheme = createTheme();

export default function ChangePass({ email }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("/api/change-password", { email, newPassword });
      if (response.data.success) {
        navigate("/login");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <p
              style={{
                color: "gray",
                fontSize: "12px",
              }}
            >
              At least 6 characters long, with 1 special character
            </p>
            <span className="formLabels">
              New Password
              <span style={{ color: "var(--color-quaternary)" }}> *</span>
            </span>
            <Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <span className="formLabels">
              Confirm New Password
              <span style={{ color: "var(--color-quaternary)" }}> *</span>
            </span>
            <Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!error}
              label="Confirm Password"
              helperText={error}
            />
            {success && <Typography color="primary">{success}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundImage: "linear-gradient(90deg, #f89a47, #f15f3e, #ec2073);",
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
