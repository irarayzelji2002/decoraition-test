import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IconButton, Menu, TextField } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { CommentIcon, ShareIcon } from "./svg/DefaultMenuIcons";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChangeModeMenu from "./ChangeModeMenu.jsx";
import CopyLinkModal from "./CopyLinkModal.jsx";
import DefaultMenu from "./DefaultMenu.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import DownloadModal from "./DownloadModal.jsx";
import InfoModal from "./InfoModal.jsx";
import RenameModal from "./RenameModal.jsx";
import RestoreModal from "./RestoreModal.jsx";
import ShareModal from "./ShareModal.jsx";
import ManageAccessModal from "./ManageAccessModal.jsx";
import ShareMenu from "./ShareMenu.jsx";
import MakeCopyModal from "./MakeCopyModal.jsx";
import ShareConfirmationModal from "./ShareConfirmationModal.jsx";
import "../css/design.css";
import DrawerComponent from "../pages/Homepage/DrawerComponent.jsx";
import Version from "../pages/DesignSpace/Version.jsx";
import { showToast } from "../functions/utils.js";
import {
  handleNameChange,
  handleRestoreDesignVersion,
  handleCopyDesign,
  handleAddCollaborators,
  handleAccessChange as handleAccessChangeDesign,
} from "../pages/DesignSpace/backend/DesignActions.jsx";
import { handleMoveDesignToTrash } from "../pages/Homepage/backend/HomepageActions.jsx";
import { useSharedProps } from "../contexts/SharedPropsContext.js";
import { toggleComments } from "../pages/DesignSpace/backend/DesignActions.jsx";
import { useNetworkStatus } from "../hooks/useNetworkStatus.js";
import deepEqual from "deep-equal";
import { textFieldInputProps } from "../pages/DesignSpace/DesignSettings.jsx";

function DesignHead({
  design,
  changeMode,
  setChangeMode,
  setShowComments = () => {},
  isSelectingMask = false,
}) {
  const { user, userDoc, handleLogout, notificationUpdate } = useSharedProps();
  const { designId } = useParams();
  const isOnline = useNetworkStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesignPath = location.pathname.startsWith("/design");
  const navigateFrom = location.pathname;

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElShare, setAnchorElShare] = useState(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const [isChangeModeMenuOpen, setIsChangeModeMenuOpen] = useState(false);
  const [isChangeModeVisible, setIsChangeModeVisible] = useState(false);
  const [role, setRole] = useState(0); //0 for viewer (default), 1 for editor, 2 for commenter, 3 for owner

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isManageAccessModalOpen, setIsManageAccessModalOpen] = useState(false);
  const [isViewCollabModalOpen, setIsViewCollabModalOpen] = useState(false);
  const [isViewCollab, setIsViewCollab] = useState(false);
  const [isShareConfirmationModalOpen, setIsShareConfirmationModalOpen] = useState(false);
  const [shouldOpenViewCollab, setShouldOpenViewCollab] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadVisible, setIsDownloadVisible] = useState(false);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoreVisible, setIsRestoreVisible] = useState(false);

  const [isMakeCopyModalOpen, setIsMakeCopyModalOpen] = useState(false);
  const [isMakeCopyVisible, setIsMakeCopyVisible] = useState(false);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  // const [collaborators, setCollaborators] = useState([]);
  // const [newCollaborator, setNewCollaborator] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // history
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  useEffect(() => {
    if (!design || !user || !userDoc) return;

    let newRole = 0;

    // First check if restricted access
    if (design?.designSettings?.generalAccessSetting === 0) {
      // Only check explicit roles
      if (userDoc.id === design.owner) newRole = 3;
      else if (design.editors?.includes(userDoc.id)) newRole = 1;
      else if (design.commenters?.includes(userDoc.id)) newRole = 2;
      else if (design.viewers?.includes(userDoc.id)) newRole = 0;
    } else {
      // Anyone with link - check both explicit roles and general access
      if (userDoc.id === design.owner) newRole = 3;
      else if (
        design.editors?.includes(userDoc.id) ||
        design?.designSettings?.generalAccessRole === 1
      )
        newRole = 1;
      else if (
        design.commenters?.includes(userDoc.id) ||
        design?.designSettings?.generalAccessRole === 2
      )
        newRole = 2;
      else newRole = design?.designSettings?.generalAccessRole ?? 0;
    }

    setNewName(design?.designName ?? "Untitled Design");
    // Set role and all dependent flags
    setRole(newRole);
    setIsViewCollab(newRole < 1);
    setIsChangeModeVisible(newRole > 0);
    if (design.history && design.history.length > 0)
      setIsRestoreVisible(newRole === 1 || newRole === 3);
    setIsRenameVisible((newRole === 1 || newRole === 3) && changeMode === "Editing");
    setIsDeleteVisible(newRole === 3 && changeMode === "Editing");
    // Set visibility based on design settings
    setIsDownloadVisible(!!design?.designSettings?.allowDownload || newRole === 1 || newRole === 3);
    setIsHistoryVisible(
      !!design?.designSettings?.allowViewHistory || newRole === 1 || newRole === 3
    );
    setIsMakeCopyVisible(!!design?.designSettings?.allowCopy || newRole === 1 || newRole === 3);

    handleDefaultChangeMode(newRole);
  }, [design, user, userDoc, changeMode]);

  useEffect(() => {
    console.log("DesignHead - changeMode role:", role);
    console.log("DesignHead - changeMode:", changeMode);
  }, [role, changeMode]);

  const handleDefaultChangeMode = (role) => {
    if (!role) return;
    if (role === 3 || role === 1) {
      if (!location?.state?.changeMode && !location.pathname.startsWith("/budget"))
        setChangeMode("Editng");
      else if (
        location.pathname.startsWith("/budget") &&
        location?.state?.changeMode === "Commenting"
      )
        setChangeMode("Editing");
    } else if (role === 2) {
      if (
        (!location?.state?.changeMode || location?.state?.changeMode === "Editing") &&
        !location.pathname.startsWith("/budget")
      )
        setChangeMode("Commenting");
      else if (
        location.pathname.startsWith("/budget") &&
        location?.state?.changeMode === "Commenting"
      )
        setChangeMode("Viewing");
    } else if (role === 0) {
      if (
        !location?.state?.changeMode ||
        location?.state?.changeMode === "Editing" ||
        location?.state?.changeMode === "Commenting"
      )
        setChangeMode("Viewing");
    }
  };

  useEffect(() => {
    if (shouldOpenViewCollab && !isManageAccessModalOpen) {
      setIsViewCollabModalOpen(true);
      setShouldOpenViewCollab(false);
    }
  }, [shouldOpenViewCollab, isManageAccessModalOpen]);

  const handleHistoryClick = () => {
    setIsHistoryOpen(true);
    handleClose();
  };

  const handleHistoryClose = () => {
    setIsHistoryOpen(false);
  };

  const handleEditNameToggle = () => {
    setIsEditingName((prev) => !prev);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsShareMenuOpen(false);
    setIsChangeModeMenuOpen(false);
  };

  const handleCloseShare = () => {
    setAnchorElShare(null);
    setIsShareMenuOpen(false);
  };

  const handleShareClick = (event) => {
    event.stopPropagation();
    console.log("Share clicked");
    console.log("anchorEl", anchorEl);
    setAnchorElShare(event.currentTarget);
    setIsShareMenuOpen(true);
  };

  const handleChangeModeClick = () => {
    setIsChangeModeMenuOpen(true);
  };

  const handleBackToMenu = () => {
    setIsShareMenuOpen(false);
    setIsChangeModeMenuOpen(false);
  };

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
    handleClose();
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleOpenManageAccessModal = () => {
    setIsManageAccessModalOpen(true);
    handleClose();
  };

  const handleCloseManageAccessModal = () => {
    setIsManageAccessModalOpen(false);
  };

  const handleOpenViewCollabModal = () => {
    setIsViewCollabModalOpen(true);
    handleClose();
  };

  const handleCloseViewCollabModal = () => {
    setIsViewCollabModalOpen(false);
  };

  // const handleAddCollaborator = () => {
  //   if (newCollaborator.trim() !== "") {
  //     setCollaborators([...collaborators, newCollaborator]);
  //     setNewCollaborator("");
  //   }
  // };

  // const handleShareProject = () => {
  //   if (collaborators.length > 0) {
  //     setIsShareModalOpen(false);
  //     setIsShareConfirmationModalOpen(true);
  //   }
  // };

  const handleCloseShareConfirmationModal = () => {
    setIsShareConfirmationModalOpen(false);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleOpenDownloadModal = () => {
    setIsDownloadModalOpen(true);
    handleClose();
  };

  const handleCloseDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  const handleOpenRenameModal = () => {
    setIsRenameModalOpen(true);
    handleClose();
  };

  const handleCloseRenameModal = () => {
    setIsRenameModalOpen(false);
  };

  const handleOpenRestoreModal = () => {
    setIsRestoreModalOpen(true);
    handleClose();
  };

  const handleCloseRestoreModal = () => {
    setIsRestoreModalOpen(false);
  };

  const handleOpenMakeCopyModal = () => {
    setIsMakeCopyModalOpen(true);
    handleClose();
  };

  const handleCloseMakeCopyModal = () => {
    setIsMakeCopyModalOpen(false);
  };

  const handleOpenInfoModal = () => {
    handleClose();
    navigate(`/details/design/${design.id}`, {
      state: { navigateFrom: navigateFrom },
    });
  };

  const handleCloseInfoModal = () => {
    // setIsInfoModalOpen(false);
  };
  const handleInputClick = () => {
    // Enable edit mode when the input is clicked
    handleEditNameToggle();
  };

  // Rename Navbar Action
  const handleBlur = async () => {
    // Save the name when the user clicks away from the input field
    if (!isEditingName) {
      return;
    }
    if (design.designName === newName.trim()) {
      setIsEditingName(false);
      return;
    }
    const result = await handleNameChange(design.id, newName, user, userDoc, setIsEditingName);
    console.log("result", result);
    if (!result.success) showToast("error", result.message);
    else showToast("success", result.message);
  };

  // Add Collaborators Modal Action
  const handleShare = async (design, emails, role, message, notifyPeople = false) => {
    if (emails.length === 0) {
      return { success: false, message: "No email addresses added" };
    }
    if (role < 0 || role > 4) {
      return { success: false, message: "Select a valid role" };
    }
    try {
      const result = await handleAddCollaborators(
        design,
        emails,
        role,
        message,
        notifyPeople,
        user,
        userDoc
      );
      if (result.success) {
        handleClose();
        handleCloseShareModal();
        return { success: true, message: "Design shared to collaborators" };
      } else {
        return { success: false, message: "Failed to share design to collaborators" };
      }
    } catch (error) {
      console.error("Error sharing design:", error);
      return { success: false, message: "Failed to share design to collaborators" };
    }
  };

  // Manage Access Modal Action
  const handleAccessChange = async (
    design,
    initEmailsWithRole,
    emailsWithRole,
    generalAccessSetting,
    generalAccessRole
  ) => {
    // If no roles have changed, return early
    if (
      deepEqual(initEmailsWithRole, emailsWithRole) &&
      generalAccessSetting === design?.designSettings?.generalAccessSetting &&
      generalAccessRole === design?.designSettings?.generalAccessRole
    ) {
      return { success: false, message: "Nothing changed" };
    }
    try {
      const result = await handleAccessChangeDesign(
        design,
        initEmailsWithRole,
        emailsWithRole,
        generalAccessSetting,
        generalAccessRole,
        user,
        userDoc
      );
      if (result.success) {
        handleClose();
        handleCloseManageAccessModal();
        return { success: true, message: "Design access changed" };
      } else {
        return { success: false, message: "Failed to change access of design" };
      }
    } catch (error) {
      console.error("Error changing access of design:", error);
      return { success: false, message: "Failed to change access of design" };
    }
  };

  const handleShowViewCollab = useCallback(() => {
    setShouldOpenViewCollab(true);
    handleCloseManageAccessModal();
    setTimeout(() => {
      setIsViewCollabModalOpen(true);
    }, 100);
  }, []);

  // Make a Copy Modal Action
  const handleCopy = async (design, designVersionId, shareWithCollaborators = false) => {
    if (!designVersionId) {
      return { success: false, message: "Select a version to copy" };
    }
    try {
      const result = await handleCopyDesign(
        design,
        designVersionId,
        shareWithCollaborators,
        user,
        userDoc
      );
      if (result.success) {
        handleClose();
        handleCloseMakeCopyModal();
        return { success: true, message: "Design copied", designId: result?.designId };
      } else {
        return { success: false, message: "Failed to copy design" };
      }
    } catch (error) {
      console.error("Error copying design:", error);
      return { success: false, message: "Failed to copy design" };
    }
  };

  // Restore Modal Action
  const handleRestore = async (design, designVersionId) => {
    if (!designVersionId) {
      return { success: false, message: "Select a version to restore" };
    }
    try {
      const result = await handleRestoreDesignVersion(design, designVersionId, user, userDoc);
      if (result.success) {
        handleClose();
        handleCloseRestoreModal();
        return { success: true, message: "Design restored" };
      } else {
        return { success: false, message: "Failed to restore design" };
      }
    } catch (error) {
      console.error("Error restoring design:", error);
      return { success: false, message: "Failed to restore design" };
    }
  };

  // Rename Modal Action
  const handleRename = async (newName) => {
    if (design.designName === newName.trim()) {
      return { success: false, message: "Name is the same as the current name" };
    }
    try {
      const result = await handleNameChange(design.id, newName, user, userDoc, setIsEditingName);
      console.log("result", result);
      if (result.success) {
        handleClose();
        handleCloseRenameModal();
        return { success: true, message: "Design name updated successfully" };
      } else {
        return { success: false, message: "Failed to update design name" };
      }
    } catch (error) {
      console.error("Error updating design name:", error);
      return { success: false, message: "Failed to update design name" };
    }
  };

  // Delete Modal Action
  const handleDelete = async () => {
    const result = await handleMoveDesignToTrash(user, userDoc, design.id);
    if (!result.success) {
      showToast("error", "Failed to move design to trash");
    }
    showToast("success", "Design moved to trash");
    navigate("/trash", {
      state: { navigateFrom: navigateFrom, tab: "Designs", designId: design.id },
    });
    handleCloseDeleteModal();
  };

  // Copy Link Action
  const handleCopyLink = async () => {
    try {
      const currentLink = window.location.href; // Get the current URL
      await navigator.clipboard.writeText(currentLink);
      showToast("success", "Link copied to clipboard!");
      handleClose();
    } catch (err) {
      showToast("error", "Failed to copy link.");
      console.error("Failed to copy: ", err);
    }
  };

  // Navigate to settings
  const handleSettings = () => {
    navigate(`/settings/design/${design.id}`, {
      state: { navigateFrom: navigateFrom },
    });
  };

  // Notification highlight
  const highlightDesignName = (designName) => {
    console.log("notif (design head) - attempting to highlight design name");
    const nameElement = document.querySelector(".design-name");
    console.log("notif (design head) - found nameElement:", nameElement);

    if (nameElement) {
      nameElement.scrollIntoView({ behavior: "smooth" });
      nameElement.classList.add("highlight-animation");
      setTimeout(() => {
        nameElement.classList.remove("highlight-animation");
      }, 3000);
    } else {
      console.log("notif (design head) - nameElement not found in DOM, retrying in 500ms");
      setTimeout(() => {
        const retryElement = document.querySelector(".design-name");
        console.log("notif (design head) - retry found nameElement:", retryElement);
        if (retryElement) {
          retryElement.scrollIntoView({ behavior: "smooth" });
          retryElement.classList.add("highlight-animation");
          setTimeout(() => {
            retryElement.classList.remove("highlight-animation");
          }, 3000);
        }
      }, 500);
    }
  };

  useEffect(() => {
    const handleNotificationActions = async () => {
      console.log("notif (design head) - handleNotificationActions called - design:", design);
      if (!design) return;

      const pendingActions = localStorage.getItem("pendingNotificationActions");
      console.log("notif (design head) - pendingActions from localStorage:", pendingActions);

      if (pendingActions) {
        try {
          const parsedActions = JSON.parse(pendingActions);
          console.log("notif (design head) - parsed pendingActions:", parsedActions);

          const { actions, references, timestamp, completed, type, title } = parsedActions;

          const uniqueCompleted = completed.reduce((acc, current) => {
            const x = acc.find((item) => item.index === current.index);
            if (!x) return acc.concat([current]);
            return acc;
          }, []);

          for (const [index, action] of actions.entries()) {
            console.log("notif (design head) - Processing action:", action, "at index:", index);

            const isAlreadyCompleted = uniqueCompleted.some((c) => c.index === index);
            if (isAlreadyCompleted) {
              console.log(`notif (design head) - Action at index ${index} already completed`);
              continue;
            }

            const previousActionsCompleted =
              uniqueCompleted.filter((c) => c.index < index).length === index;
            console.log(
              "notif (design head) - previousActionsCompleted:",
              previousActionsCompleted
            );

            if (action === "Highlight design name" && previousActionsCompleted) {
              highlightDesignName(design.designName);
              uniqueCompleted.push({ action, index, timestamp });
              localStorage.setItem(
                "pendingNotificationActions",
                JSON.stringify({
                  actions,
                  references,
                  timestamp,
                  completed: uniqueCompleted,
                  type,
                  title,
                })
              );
            } else if (action === "Open view collaborators modal" && previousActionsCompleted) {
              setIsViewCollabModalOpen(true);
              uniqueCompleted.push({ action, index, timestamp });
              localStorage.setItem(
                "pendingNotificationActions",
                JSON.stringify({
                  actions,
                  references,
                  timestamp,
                  completed: uniqueCompleted,
                  type,
                  title,
                })
              );
            } else if (action === "Hide drawers" && previousActionsCompleted) {
              setDrawerOpen(false);
              setIsNotifOpen(false);
              uniqueCompleted.push({ action, index, timestamp });
              localStorage.setItem(
                "pendingNotificationActions",
                JSON.stringify({
                  actions,
                  references,
                  timestamp,
                  completed: uniqueCompleted,
                  type,
                  title,
                })
              );
            }

            if (index === actions.length - 1 && uniqueCompleted.length === actions.length) {
              console.log(
                "notif (design head) - Removing pendingNotificationActions from localStorage"
              );
              localStorage.removeItem("pendingNotificationActions");
            }
          }
        } catch (error) {
          console.error("Error processing notification actions:", error);
        }
      }
    };

    handleNotificationActions();
  }, [design, notificationUpdate, setDrawerOpen, setIsNotifOpen]);

  return (
    <div className={`designHead stickyMenu`}>
      <DrawerComponent
        isDrawerOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        isNotifOpen={isNotifOpen}
        setIsNotifOpen={setIsNotifOpen}
      />
      <Version
        isDrawerOpen={isHistoryOpen}
        onClose={handleHistoryClose}
        design={design}
        isHistory={true}
        handleSelect={null}
        title="History"
      />
      <div className="left">
        <IconButton
          size="large"
          edge="start"
          color="var(--color-white)"
          aria-label="open drawer"
          onClick={setDrawerOpen}
          sx={{
            backgroundColor: "transparent",
            margin: "3px 5px 3px -5px",
            "&:hover": {
              backgroundColor: "var(--iconButtonHover)",
            },
            "& .MuiTouchRipple-root span": {
              backgroundColor: "var(--iconButtonActive)",
            },
          }}
        >
          <MenuIcon sx={{ color: "var(--color-white)" }} />
        </IconButton>
        <div className="design-name-section">
          {isEditingName && isRenameVisible ? (
            <>
              <TextField
                placeholder="Design Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.blur();
                  }
                }}
                autoFocus
                onBlur={handleBlur}
                variant="outlined"
                className="headTitleInput headTitle"
                fullWidth
                InputProps={textFieldInputProps}
                inputProps={{ maxLength: 100 }}
                sx={{
                  backgroundColor: "transparent",
                  input: { color: "var(--color-white)" },
                  padding: "0px",
                  marginTop: "3px",
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    padding: "8px 15px",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "var( --borderInput)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var( --borderInput)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--borderInputBrighter)",
                    },
                    "& input": {
                      padding: 0,
                    },
                  },
                }}
              />
              {newName.length >= 100 && (
                <div style={{ color: "var( --errorText)", fontSize: "0.8rem" }}>
                  Character limit reached!
                </div>
              )}
            </>
          ) : (
            <div onClick={handleInputClick} className="navhead design-name">
              <span className="headTitleInput" style={{ height: "20px" }}>
                {design?.designName ?? "Untitled Design"}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="right">
        {isDesignPath && (role === 1 || role === 2 || role === 3) && !isSelectingMask && (
          <IconButton
            sx={{
              color: "var(--color-white)",
              "&:hover": {
                backgroundColor: "var(--iconButtonHover)",
              },
              "& .MuiTouchRipple-root span": {
                backgroundColor: "var(--iconButtonActive)",
              },
            }}
            onClick={() => toggleComments(setShowComments)}
          >
            <CommentIcon />
          </IconButton>
        )}
        <IconButton
          sx={{
            color: "var(--color-white)",
            "&:hover": {
              backgroundColor: "var(--iconButtonHover)",
            },
            "& .MuiTouchRipple-root span": {
              backgroundColor: "var(--iconButtonActive)",
            },
          }}
          onClick={handleShareClick}
        >
          <ShareIcon />
        </IconButton>
        <IconButton
          sx={{
            padding: "4px",
            color: "var(--color-white)",
            "&:hover": {
              backgroundColor: "var(--iconButtonHover)",
            },
            "& .MuiTouchRipple-root span": {
              backgroundColor: "var(--iconButtonActive)",
            },
          }}
          onClick={handleClick}
        >
          <MoreVertIcon sx={{ fontSize: "1.9rem" }} />
        </IconButton>
        {!isOnline && (
          <div className="offline-bar">You are offline. Please check your internet connection.</div>
        )}
        {anchorEl === null && isShareMenuOpen && (
          <Menu
            anchorEl={anchorElShare}
            open={Boolean(anchorElShare)}
            onClose={handleCloseShare}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "hidden",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  backgroundColor: "var(  --nav-card-modal)",
                  color: "var(--color-white)",
                  minWidth: "220px",
                  top: "62px !important",
                  right: "0px !important",
                  left: "auto !important",
                  borderTopLeftRadius: "0px",
                  borderTopRightRadius: "0px",
                  borderBottomLeftRadius: "10px",
                  borderBottomRightRadius: "0px",
                  "& .MuiList-root": {
                    overflow: "hidden",
                  },
                },
              },
            }}
            MenuListProps={{
              sx: {
                color: "var(--color-white)",
                padding: "0px !important",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <ShareMenu
              onClose={handleCloseShare}
              onBackToMenu={handleCloseShare}
              onOpenShareModal={handleOpenShareModal}
              onOpenManageAccessModal={handleOpenManageAccessModal}
              onOpenManageAccessModalView={handleOpenViewCollabModal}
              isViewCollab={isViewCollab}
              isFromMenu={false}
            />
          </Menu>
        )}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "hidden",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                backgroundColor: "var(--nav-card-modal)",
                color: "var(--color-white)",
                minWidth: "220px",
                top: "62px !important",
                right: "0px !important",
                left: "auto !important",
                borderTopLeftRadius: "0px",
                borderTopRightRadius: "0px",
                borderBottomLeftRadius: "10px",
                borderBottomRightRadius: "0px",
                "& .MuiList-root": {
                  overflow: "hidden",
                },
              },
            },
          }}
          MenuListProps={{
            sx: {
              color: "var(--color-white)",
              padding: "0px !important",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {isShareMenuOpen ? (
            <ShareMenu
              onClose={handleClose}
              onBackToMenu={handleBackToMenu}
              onOpenShareModal={handleOpenShareModal}
              onOpenManageAccessModal={handleOpenManageAccessModal}
              onOpenManageAccessModalView={handleOpenViewCollabModal}
              isViewCollab={isViewCollab}
            />
          ) : isChangeModeMenuOpen ? (
            <ChangeModeMenu
              onClose={handleClose}
              onBackToMenu={handleBackToMenu}
              role={role}
              changeMode={changeMode}
              setChangeMode={setChangeMode}
              isDesign={true}
            />
          ) : (
            <DefaultMenu
              isDesign={true}
              onComment={() => toggleComments(setShowComments)} // design only
              onOpenShareModal={handleShareClick}
              onCopyLink={handleCopyLink}
              setIsSidebarOpen={handleHistoryClick} // design only
              onSetting={handleSettings}
              onChangeMode={handleChangeModeClick}
              changeMode={changeMode}
              onOpenDownloadModal={handleOpenDownloadModal}
              onOpenMakeCopyModal={handleOpenMakeCopyModal} // design only
              onOpenRestoreModal={handleOpenRestoreModal} // design only
              onOpenRenameModal={handleOpenRenameModal}
              onDelete={handleOpenDeleteModal}
              onOpenInfoModal={handleOpenInfoModal}
              designSettingsVisibility={{
                isDownloadVisible,
                isHistoryVisible,
                isMakeCopyVisible,
                isRestoreVisible,
                isRenameVisible,
                isDeleteVisible,
                isChangeModeVisible,
              }}
              isSelectingMask={isSelectingMask}
            />
          )}
        </Menu>
      </div>
      {/* Comment (No Modal) */}
      {/* Share */}
      {/* <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        onAddCollaborator={handleAddCollaborator}
        onShareProject={handleShareProject}
        collaborators={collaborators}
        newCollaborator={newCollaborator}
        isDesign={true}
      /> */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        handleShare={handleShare}
        isDesign={true}
        object={design}
        onShowViewCollab={handleShowViewCollab}
      />
      <ManageAccessModal
        isOpen={isManageAccessModalOpen}
        onClose={handleCloseManageAccessModal}
        handleAccessChange={handleAccessChange}
        isDesign={true}
        object={design}
        isViewCollab={false}
        onShowViewCollab={handleShowViewCollab}
      />
      <ManageAccessModal
        isOpen={isViewCollabModalOpen}
        onClose={handleCloseViewCollabModal}
        handleAccessChange={() => {}}
        isDesign={true}
        object={design}
        isViewCollab={true}
      />
      {/* <ShareConfirmationModal
        isOpen={isShareConfirmationModalOpen}
        onClose={handleCloseShareConfirmationModal}
        collaborators={collaborators}
      /> */}
      {/* Copy Link (No Modal) */}
      {/* History */}
      {/* Settings (No Modal) */}
      {/* Change Mode */}
      {/* Download */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={handleCloseDownloadModal}
        isDesign={true}
        object={design}
      />
      {/* Make a Copy */}
      <MakeCopyModal
        isOpen={isMakeCopyModalOpen}
        onClose={handleCloseMakeCopyModal}
        handleCopy={handleCopy}
        design={design}
      />
      {/* Restore */}
      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={handleCloseRestoreModal}
        handleRestore={handleRestore}
        design={design}
      />
      {/* Rename */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={handleCloseRenameModal}
        handleRename={handleRename}
        isDesign={true}
        object={design}
      />
      {/* Delete */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        handleDelete={handleDelete}
        isDesign={true}
        object={design}
      />
      {/* Details */}
      <InfoModal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} />
    </div>
  );
}

export default DesignHead;

export const highlightName = (isDesign) => {
  const nameElement = document.querySelector(isDesign ? ".design-name" : ".project-name");
  if (nameElement) {
    nameElement.scrollIntoView({ behavior: "smooth" });
    nameElement.classList.add("highlight-animation");
    setTimeout(() => {
      nameElement.classList.remove("highlight-animation");
    }, 3000);
  }
};
