import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Menu, styled } from "@mui/material";
import { formatDateDetailComma } from "../pages/Homepage/backend/HomepageActions";
import { fetchVersionDetails } from "../pages/DesignSpace/backend/DesignActions";
import { useSharedProps } from "../contexts/SharedPropsContext";
import { showToast } from "../functions/utils";

const RestoreModal = ({ isOpen, onClose, handleRestore, design }) => {
  const { user } = useSharedProps();
  const [selectedDesignVersionId, setSelectedDesignVersionId] = useState("");
  const [selectedDesignVersionDate, setSelectedDesignVersionDate] = useState("");
  const [versionDetails, setVersionDetails] = useState([]);
  const [error, setError] = useState("");

  const handleClose = () => {
    onClose();
    setSelectedDesignVersionId("");
    setSelectedDesignVersionDate("");
    setVersionDetails([]);
  };

  const onSubmit = async () => {
    const result = await handleRestore(design, selectedDesignVersionId);
    if (!result.success) {
      if (result.message === "Select a version to restore") setError(result.message);
      else showToast("error", result.message);
      return;
    }
    showToast(
      "success",
      `Design restored${
        selectedDesignVersionDate ? ` to version on ${selectedDesignVersionDate}` : ""
      }`
    );
    handleClose();
  };

  useEffect(() => {
    const getVersionDetails = async () => {
      if (design?.history && design.history.length > 1) {
        const result = await fetchVersionDetails(design, user);
        if (!result.success) {
          console.error("Error:", result.message);
          setSelectedDesignVersionId("");
          setVersionDetails([]);
          return;
        }
        // Exclude last one as it is the current version
        const filteredVersions = result.versionDetails.slice(0, -1);
        setVersionDetails(filteredVersions);
        const latestVersion = filteredVersions[filteredVersions.length - 1];
        if (latestVersion) {
          setSelectedDesignVersionId(latestVersion.id);
          setSelectedDesignVersionDate(formatDateDetailComma(latestVersion.createdAt));
        }
      }
    };

    getVersionDetails();
  }, [design, user]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "var(--nav-card-modal)",
          borderRadius: "20px",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "var(--nav-card-modal)",
          color: "var(--color-white)",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--color-grey)",
          fontWeight: "bold",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            color: "var(--color-white)",
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
        Restore
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "var(  --nav-card-modal)",
          color: "var(--color-white)",
          marginTop: "20px",
        }}
      >
        <Typography variant="body1" sx={{ marginBottom: "10px" }}>
          Select a version to restore
        </Typography>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <FormControl sx={formControlStyles}>
            <InputLabel
              id="date-modified-select-label"
              sx={{
                color: "var(--color-white)",
                "&.Mui-focused": {
                  color: "var(--color-white)", // Ensure label color remains white when focused
                },
                "&.MuiInputLabel-shrink": {
                  color: "var(--color-white)", // Ensure label color remains white when shrunk
                },
                "&.Mui-focused.MuiInputLabel-shrink": {
                  color: "var(--color-white)", // Ensure label color remains white when focused and shrunk
                },
              }}
            >
              Version
            </InputLabel>
            <Select
              labelId="date-modified-select-label"
              id="date-modified-select"
              value={selectedDesignVersionId}
              label="Version"
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedDesignVersionId(selectedId);
                // Find the matching version and set its formatted date
                if (selectedId) {
                  const selectedVersion = versionDetails.find(
                    (version) => version.id === selectedId
                  );
                  if (selectedVersion) {
                    setSelectedDesignVersionDate(formatDateDetailComma(selectedVersion.createdAt));
                  }
                } else {
                  setSelectedDesignVersionDate("");
                }
              }}
              MenuComponent={StyledMenu}
              MenuProps={{
                PaperProps: {
                  sx: {
                    "& .MuiMenu-list": {
                      padding: 0, // Remove padding from the ul element
                    },
                  },
                },
              }}
              sx={{
                color: "var(--color-white)",
                backgroundColor: "var(--nav-card-modal)",
                borderBottom: "1px solid #4a4a4d",
                borderRadius: "8px",
                transition: "background-color 0.3s ease",
                "&.Mui-focused": {
                  borderBottom: "1px solid var(--focusBorderColor)",
                  outline: "none",
                  boxShadow: "none",
                  color: "var(--color-grey)",
                },

                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-white)",
                },
              }}
            >
              {/* <MenuItem value="" sx={menuItemStyles}>
                <em>None</em>
              </MenuItem>
              <MenuItem sx={menuItemStyles} value="versionId">
                <ListItemIcon>
                  <div className="select-image-preview">
                    <img src="" alt="" />
                  </div>
                </ListItemIcon>
                <Typography variant="inherit">December 25, 2021, 12:00 PM</Typography>
              </MenuItem> */}
              {versionDetails.map((version) => (
                <MenuItem key={version.id} sx={menuItemStyles} value={version.id}>
                  <div className="select-image-preview">
                    <img src={version.firstImage} alt="" />
                  </div>
                  <Typography variant="inherit">
                    {formatDateDetailComma(version.createdAt)}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
            {error && <div className="error-text">{error}</div>}
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "var(  --nav-card-modal)", margin: "10px" }}>
        {/* Restore Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={onSubmit}
          sx={{
            background: "var(--gradientButton )", // Gradient background
            borderRadius: "20px", // Button border radius
            color: "var(--color-white)", // Button text color
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              background: "var(--gradientButtonHover)", // Reverse gradient on hover
            },
          }}
        >
          Restore
        </Button>

        {/* Cancel Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleClose}
          sx={{
            background: "transparent",
            border: "2px solid transparent",
            borderRadius: "20px",
            backgroundImage: "var(--lightGradient), var(--gradientButton)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            fontWeight: "bold",
            textTransform: "none",
            color: "var(--color-white)",
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundImage = "var(--lightGradient), var(--gradientButtonHover)")
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundImage = "var(--lightGradient), var(--gradientButton)")
          }
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreModal;

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    backgroundColor: "var(--nav-card-modal)",
    color: "var(--color-white)",
    borderRadius: "12px",
    padding: 0,
    margin: 0,
    border: "none",
    overflow: "hidden",
  },
  "& .MuiList-root": {
    padding: 0,
  },
  "& .MuiMenuItem-root": {
    "&.Mui-selected": {
      backgroundColor: "transparent", // Custom background color for selected item
      "&:hover": {
        backgroundColor: "transparent", // Custom hover color for selected item
      },
    },
    "&:focus": {
      outline: "none",
      boxShadow: "none", // Remove blue outline effect
    },
  },
}));

const formControlStyles = {
  m: 1,
  width: "80%",
  backgroundColor: "var(--nav-card-modal)",
  color: "var(--color-white)",
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var( --borderInput)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--bright-grey) !important",
  },
  "& .MuiSvgIcon-root": {
    color: "var(--color-white)", // Set the arrow color to white
  },
};

const menuItemStyles = {
  color: "var(--color-white)",
  backgroundColor: "var(--dropdown)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "var(--dropdownHover)",
  },
  "&.Mui-selected": {
    backgroundColor: "var(--dropdownSelected)",
    color: "var(--nav-card-modal)",
    fontWeight: "bold",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "var(--dropdownHover)",
  },
};
