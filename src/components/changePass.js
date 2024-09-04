import * as React from "react";
import { useSearchParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase"; // Adjust this path to where you initialize Firebase
import Password from "./PassInput"; // Import your Password component
import { useState, useEffect } from "react";

const defaultTheme = createTheme();

export default function ChangePass() {
  const [searchParams] = useSearchParams();
  const actionCode = searchParams.get("oobCode");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Verify the password reset code
    verifyPasswordResetCode(auth, actionCode)
      .then((email) => {
        // Email verified, proceed to reset password
        console.log("Email verified:", email);
      })
      .catch((error) => {
        setError("Invalid or expired action code.");
        console.error("Error verifying code:", error);
      });
  }, [actionCode]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    confirmPasswordReset(auth, actionCode, newPassword)
      .then(() => {
        setSuccess("Password has been reset successfully.");
        navigate("/"); // Redirect to home page on success
      })
      .catch((error) => {
        setError("Failed to reset password.");
        console.error("Error resetting password:", error);
      });
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
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Change Password
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!error}
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
                backgroundImage: "linear-gradient(20deg, #faa653, #f04f59)",
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
