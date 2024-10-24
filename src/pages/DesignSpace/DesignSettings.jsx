import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import deepEqual from "deep-equal";
import { useSharedProps } from "../../contexts/SharedPropsContext";
import { showToast } from "../../functions/utils";
import TopBar from "../../components/TopBar";
import { db } from "../../firebase"; // Import your Firestore instance
import { doc, getDoc } from "firebase/firestore";
import {
  Typography,
  Box,
  Switch,
  TextField,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
} from "@mui/material";
import "../../css/designSettings.css"; // Import the CSS file
import PublicRoundedIcon from "@mui/icons-material/PublicRounded"; // Import the globe icon
import PublicOffRoundedIcon from "@mui/icons-material/PublicOffRounded";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "& .MuiSwitch-thumb": {
            backgroundColor: "var(--color-white)", // Color of the switch thumb
          },
          "&.Mui-checked .MuiSwitch-thumb": {
            backgroundImage: "var(--gradientCircle)", // Color when checked
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "var(--inputBg)", // Track color when checked
          },
        },
        track: {
          backgroundColor: "var(--inputBg)", // Track color
        },
      },
    },
  },
});

function DesignSettings() {
  const { user, designs, userDesigns } = useSharedProps();
  const { designId } = useParams({}); // Get the designId parameter from the URL
  const [design, setDesign] = useState();
  const [designName, setDesignName] = useState(design?.designName ?? "Untitled Design");
  const [generalAccessSetting, setGeneralAccessSetting] = useState(
    design?.designSettings?.generalAccessSetting ?? 1
  ); //0 for Restricted, 1 for Anyone with the link
  const [generalAccessRole, setGeneralAccessRole] = useState(
    design?.designSettings?.generalAccessRole ?? 0
  ); //0 for viewer, 1 for editor, 2 for owner
  const [allowDownload, setAllowDownload] = useState(design?.designSettings?.allowDownload ?? true);
  const [allowViewHistory, setAllowViewHistory] = useState(
    design?.designSettings?.allowViewHistory ?? true
  );
  const [allowCopy, setAllowCopy] = useState(design?.designSettings?.allowCopy ?? true);
  const [documentCopyByOwner, setDocumentCopyByOwner] = useState(
    design?.designSettings?.documentCopyByOwner ?? true
  );
  const [documentCopyByEditor, setDocumentCopyByEditor] = useState(
    design?.designSettings?.documentCopyByEditor ?? true
  );
  const [inactivityEnabled, setInactivityEnabled] = useState(
    design?.designSettings?.inactivityEnabled ?? true
  );
  const [inactivityDays, setInactivityDays] = useState(
    design?.designSettings?.inactivityDays ?? 30
  );
  const [deletionDays, setDeletionDays] = useState(design?.designSettings?.deletionDays ?? 30);
  const [notifyDays, setNotifyDays] = useState(design?.designSettings?.notifyDays ?? 7);
  const [activeTab, setActiveTab] = useState("Design"); // Default active tab

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (designId && userDesigns.length > 0) {
      setLoading(true);
      const fetchedDesign = userDesigns.find((design) => design.id === designId);

      if (!fetchedDesign) {
        console.error("Design not found.");
      } else {
        setDesign(fetchedDesign);
        setDesignName(fetchedDesign?.designName ?? "Untitled Design");
        setGeneralAccessSetting(fetchedDesign?.designSettings?.generalAccessSetting ?? 1);
        setGeneralAccessRole(fetchedDesign?.designSettings?.generalAccessRole ?? 0);
        setAllowDownload(fetchedDesign?.designSettings?.allowDownload ?? true);
        setAllowViewHistory(fetchedDesign?.designSettings?.allowViewHistory ?? true);
        setAllowCopy(fetchedDesign?.designSettings?.allowCopy ?? true);
        setDocumentCopyByOwner(fetchedDesign?.designSettings?.documentCopyByOwner ?? true);
        setDocumentCopyByEditor(fetchedDesign?.designSettings?.documentCopyByEditor ?? true);
        setInactivityEnabled(fetchedDesign?.designSettings?.inactivityEnabled ?? true);
        setInactivityDays(fetchedDesign?.designSettings?.inactivityDays ?? 30);
        setDeletionDays(fetchedDesign?.designSettings?.deletionDays ?? 30);
        setNotifyDays(fetchedDesign?.designSettings?.notifyDays ?? 7);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (designId && userDesigns.length > 0) {
      const fetchedDesign = userDesigns.find((design) => design.id === designId);

      if (!fetchedDesign) {
        console.error("Design not found.");
      } else if (!deepEqual(design, fetchedDesign)) {
        setDesign(fetchedDesign);
        setDesignName(fetchedDesign?.designName ?? "Untitled Design");
        setGeneralAccessSetting(fetchedDesign?.designSettings?.generalAccessSetting ?? 1);
        setGeneralAccessRole(fetchedDesign?.designSettings?.generalAccessRole ?? 0);
        setAllowDownload(fetchedDesign?.designSettings?.allowDownload ?? true);
        setAllowViewHistory(fetchedDesign?.designSettings?.allowViewHistory ?? true);
        setAllowCopy(fetchedDesign?.designSettings?.allowCopy ?? true);
        setDocumentCopyByOwner(fetchedDesign?.designSettings?.documentCopyByOwner ?? true);
        setDocumentCopyByEditor(fetchedDesign?.designSettings?.documentCopyByEditor ?? true);
        setInactivityEnabled(fetchedDesign?.designSettings?.inactivityEnabled ?? true);
        setInactivityDays(fetchedDesign?.designSettings?.inactivityDays ?? 30);
        setDeletionDays(fetchedDesign?.designSettings?.deletionDays ?? 30);
        setNotifyDays(fetchedDesign?.designSettings?.notifyDays ?? 7);
      }
    }
  }, [designId, userDesigns]);

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Change active tab
  };

  const handleSaveDesignSettings = async () => {
    try {
      const updatedSettings = {
        generalAccessSetting: generalAccessSetting,
        generalAccessRole: generalAccessRole,
        allowDownload: allowDownload,
        allowViewHistory: allowViewHistory,
        allowCopy: allowCopy,
        documentCopyByOwner: documentCopyByOwner,
        documentCopyByEditor: documentCopyByEditor,
        inactivityEnabled: inactivityEnabled,
        inactivityDays: inactivityDays,
        deletionDays: deletionDays,
        notifyDays: notifyDays,
      };
      console.log("updatedSettings", updatedSettings);

      const response = await axios.put(
        `/api/design/${designId}/update-settings`,
        {
          designSettings: updatedSettings,
        },
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );

      if (response.status === 200) {
        showToast("success", "Design settings updated successfully");
      }
    } catch (error) {
      console.error("Failed to update design settings:", error);
      showToast("error", "Failed to update design settings");
    }
  };

  return (
    <div>
      <TopBar state={`Design Settings for ${designName}`} />
      <SettingsContent
        generalAccessSetting={generalAccessSetting}
        setGeneralAccessSetting={setGeneralAccessSetting}
        generalAccessRole={generalAccessRole}
        setGeneralAccessRole={setGeneralAccessRole}
        allowDownload={allowDownload}
        setAllowDownload={setAllowDownload}
        allowViewHistory={allowViewHistory}
        setAllowViewHistory={setAllowViewHistory}
        allowCopy={allowCopy}
        setAllowCopy={setAllowCopy}
        documentCopyByOwner={documentCopyByOwner}
        setDocumentCopyByOwner={setDocumentCopyByOwner}
        documentCopyByEditor={documentCopyByEditor}
        setDocumentCopyByEditor={setDocumentCopyByEditor}
        inactivityEnabled={inactivityEnabled}
        setInactivityEnabled={setInactivityEnabled}
        inactivityDays={inactivityDays}
        setInactivityDays={setInactivityDays}
        deletionDays={deletionDays}
        setDeletionDays={setDeletionDays}
        notifyDays={notifyDays}
        setNotifyDays={setNotifyDays}
        activeTab={activeTab} // Pass activeTab to SettingsContent
        handleTabChange={handleTabChange} // Pass handleTabChange function
        handleSaveDesignSettings={handleSaveDesignSettings}
      />
    </div>
  );
}

export default DesignSettings;

const SettingsContent = ({
  generalAccessSetting,
  setGeneralAccessSetting,
  generalAccessRole,
  setGeneralAccessRole,
  allowDownload,
  setAllowDownload,
  allowViewHistory,
  setAllowViewHistory,
  allowCopy,
  setAllowCopy,
  documentCopyByOwner,
  setDocumentCopyByOwner,
  setDocumentCopyByEditor,
  documentCopyByEditor,
  inactivityEnabled,
  setInactivityEnabled,
  inactivityDays,
  setInactivityDays,
  deletionDays,
  setDeletionDays,
  notifyDays,
  setNotifyDays,
  activeTab,
  handleTabChange,
  handleSaveDesignSettings,
}) => (
  <ThemeProvider theme={theme}>
    <div className="settingsContainer">
      {/* Tab Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      ></Box>
      {/* General Access */}
      <div className="generalAccessTitle">General Access</div>
      <Box className="accessBox">
        <Box className="accessIcon">
          {generalAccessSetting === 1 ? (
            <PublicRoundedIcon sx={{ color: "var(--color-white)" }} />
          ) : (
            generalAccessSetting === 0 && (
              <PublicOffRoundedIcon sx={{ color: "var(--color-white)" }} />
            )
          )}
        </Box>
        <Select
          value={generalAccessSetting}
          onChange={(e) => setGeneralAccessSetting(parseInt(e.target.value, 10))}
          className="accessSelect"
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--borderInput)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--bright-grey)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--bright-grey)",
            },
            "& .MuiSelect-select": {
              color: "var(--color-white)",
            },
            "& .MuiSvgIcon-root": {
              color: "var(--color-white)", // Set the arrow icon color to white
            },
          }}
        >
          <MenuItem
            value={0}
            sx={{
              backgroundColor: "var(--bgColor)",
              color: "var(--color-grey)",
              "&:hover": {
                backgroundColor: "var(--dropdownHover)",
                color: "var(--color-white)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--dropdownSelected)",
                color: "var(--color-white)",
              },
            }}
          >
            <div>Restricted</div>
            <div>Only collaborators can access</div>
          </MenuItem>
          <MenuItem
            value={1}
            sx={{
              backgroundColor: "var(--bgColor)",
              color: "var(--color-white)",
              "&:hover": {
                backgroundColor: "var(--dropdownHover)",
                color: "var(--color-white)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--dropdownSelected)",
                color: "var(--color-white)",
              },
            }}
          >
            <div>Anyone with the link</div>
            <div>Anyone on the internet can access</div>
          </MenuItem>
        </Select>
        <Select
          value={generalAccessRole}
          onChange={(e) => setGeneralAccessRole(parseInt(e.target.value, 10))}
          className="accessSelect"
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--borderInput)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--bright-grey)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--bright-grey)",
            },
            "& .MuiSelect-select": {
              color: "var(--color-white)",
            },
            "& .MuiSvgIcon-root": {
              color: "var(--color-white)", // Set the arrow icon color to white
            },
          }}
        >
          <MenuItem
            value={0}
            sx={{
              backgroundColor: "var(--bgColor)",
              color: "var(--color-white)",
              "&:hover": {
                backgroundColor: "var(--dropdownHover)",
                color: "var(--color-white)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--dropdownSelected)",
                color: "var(--color-white)",
              },
            }}
          >
            <div>Viewer</div>
          </MenuItem>
          <MenuItem
            value={1}
            sx={{
              backgroundColor: "var(--bgColor)",
              color: "var(--color-white)",
              "&.Mui-selected": {
                backgroundColor: "var(--dropdownSelected)",
                color: "var(--color-white)",
              },
            }}
          >
            <div>Editor</div>
          </MenuItem>
          <MenuItem
            value={2}
            sx={{
              backgroundColor: "var(--bgColor)",
              color: generalAccessSetting === 0 ? "var(--color-white)" : "var(--color-grey)",
              "&:hover": {
                backgroundColor: "var(--dropdownHover)",
                color: "var(--color-white)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--dropdownSelected)",
                color: "var(--color-white)",
              },
            }}
          >
            <div>Owner</div>
          </MenuItem>
        </Select>
      </Box>
      {/* Viewer Settings */}
      <Typography className="viewerSettingsTitle">Viewer settings</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            color="warning"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)",
              },
              "& .MuiSwitch-thumb": {
                backgroundImage: "var(--color-white)", // Apply gradient to the thumb
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)", // Track color
              },
            }}
          />
        }
        label="Allow to download"
        labelPlacement="start"
        className="viewerSettingsLabel"
      />{" "}
      {/* Allow to view history */}
      <FormControlLabel
        control={
          <Switch
            checked={allowViewHistory}
            onChange={(e) => setAllowViewHistory(e.target.checked)}
            color="warning"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)",
              },
              "& .MuiSwitch-thumb": {
                backgroundImage: "var(--color-white)", // Apply gradient to the thumb
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)", // Track color
              },
            }}
          />
        }
        label="Allow to view history"
        labelPlacement="start"
        className="viewerSettingsLabel"
      />
      {/* Allow to make a copy */}
      <FormControlLabel
        control={
          <Switch
            checked={allowCopy}
            onChange={(e) => setAllowCopy(e.target.checked)}
            color="warning"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)",
              },
              "& .MuiSwitch-thumb": {
                backgroundImage: "var(--color-white)", // Apply gradient to the thumb
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)", // Track color
              },
            }}
          />
        }
        label="Allow to make a copy"
        labelPlacement="start"
        className="viewerSettingsLabel"
      />
      {/* History Settings */}
      <Typography className="viewerSettingsTitle">History settings</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={documentCopyByOwner}
            onChange={(e) => setDocumentCopyByOwner(e.target.checked)}
            color="warning"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)",
              },
              "& .MuiSwitch-thumb": {
                backgroundImage: "var(--color-white)", // Apply gradient to the thumb
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)", // Track color
              },
            }}
          />
        }
        label="Document copies made by owner"
        labelPlacement="start"
        className="HistorySettingsLabel"
      />{" "}
      <FormControlLabel
        control={
          <Switch
            checked={documentCopyByEditor}
            onChange={(e) => setDocumentCopyByEditor(e.target.checked)}
            color="warning"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)",
              },
              "& .MuiSwitch-thumb": {
                backgroundImage: "var(--color-white)", // Apply gradient to the thumb
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)", // Track color
              },
            }}
          />
        }
        label="Document copies made by editor"
        labelPlacement="start"
        className="HistorySettingsLabel"
      />
      {/* Inactivity and Deletion */}
      <Typography className="inactivityTitle">Inactivity and deletion</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={inactivityEnabled}
            onChange={(e) => setInactivityEnabled(e.target.checked)}
            color="warning"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)",
              },
              "& .MuiSwitch-thumb": {
                backgroundImage: "var(--color-white)", // Apply gradient to the thumb
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--inputBg)", // Track color
              },
            }}
          />
        }
        label="Enable inactivity and deletion"
        labelPlacement="start"
        className="inactivityLabel"
      />
      {/* Inactivity Settings */}
      {inactivityEnabled && (
        <>
          <Box className="inactivitySettings">
            <Typography>Number of days before inactivity after user inactivity</Typography>
            <Select
              value={inactivityDays}
              onChange={(e) => setInactivityDays(parseInt(e.target.value, 10))}
              className="accessSelect" //old inactivityTextField
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--borderInput)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--bright-grey)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--bright-grey)",
                },
                "& .MuiSelect-select": {
                  color: "var(--color-white)",
                },
                "& .MuiSvgIcon-root": {
                  color: "var(--color-white)", // Set the arrow icon color to white
                },
              }}
            >
              <MenuItem
                value={15}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>15 days</div>
              </MenuItem>
              <MenuItem
                value={30}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>30 days</div>
              </MenuItem>
              <MenuItem
                value={45}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>45 days</div>
              </MenuItem>
              <MenuItem
                value={60}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>60 days</div>
              </MenuItem>
            </Select>
          </Box>

          <Box className="inactivitySettings">
            <Typography>Number of days before deletion after project inactivity</Typography>
            <Select
              value={deletionDays}
              onChange={(e) => setDeletionDays(parseInt(e.target.value, 10))}
              className="accessSelect" //old inactivityTextField
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--borderInput)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--bright-grey)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--bright-grey)",
                },
                "& .MuiSelect-select": {
                  color: "var(--color-white)",
                },
                "& .MuiSvgIcon-root": {
                  color: "var(--color-white)", // Set the arrow icon color to white
                },
              }}
            >
              <MenuItem
                value={15}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>15 days</div>
              </MenuItem>
              <MenuItem
                value={30}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>30 days</div>
              </MenuItem>
              <MenuItem
                value={45}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>45 days</div>
              </MenuItem>
              <MenuItem
                value={60}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>60 days</div>
              </MenuItem>
            </Select>
          </Box>

          <Box className="inactivitySettings">
            <Typography>
              Notify collaborators number of days prior to entering inactivity mode and deletion
            </Typography>
            <Select
              value={notifyDays}
              onChange={(e) => setNotifyDays(parseInt(e.target.value, 10))}
              className="accessSelect" //old inactivityTextField
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--borderInput)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--bright-grey)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--bright-grey)",
                },
                "& .MuiSelect-select": {
                  color: "var(--color-white)",
                },
                "& .MuiSvgIcon-root": {
                  color: "var(--color-white)", // Set the arrow icon color to white
                },
              }}
            >
              <MenuItem
                value={3}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>3 days</div>
              </MenuItem>
              <MenuItem
                value={7}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>7 days</div>
              </MenuItem>
              <MenuItem
                value={14}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>14 days</div>
              </MenuItem>
              <MenuItem
                value={30}
                sx={{
                  backgroundColor: "var(--bgColor)",
                  color: "var(--color-white)",
                  "&:hover": {
                    backgroundColor: "var(--dropdownHover)",
                    color: "var(--color-white)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--dropdownSelected)",
                    color: "var(--color-white)",
                  },
                }}
              >
                <div>30 days</div>
              </MenuItem>
            </Select>
          </Box>
        </>
      )}
      {/* Save Button */}
      <Box className="saveButtonContainer">
        <Button className="saveButton" onClick={handleSaveDesignSettings}>
          Save
        </Button>
      </Box>
    </div>
  </ThemeProvider>
);
