import React, { useState } from "react";
import { IconButton, Menu } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import ChangeModeMenu from "./ChangeModeMenu.js";
import CopyLinkModal from "./CopyLinkModal.js";
import DefaultMenu from "./DefaultMenu.js";
import DeleteConfirmationModal from "./DeleteConfirmationModal.js";
import DownloadModal from "./DownloadModal.js";
import InfoModal from "./InfoModal.js";
import RenameModal from "./RenameModal.js";
import RestoreModal from "./RestoreModal.js";
import ShareModal from "./ShareModal.js";
import ShareMenu from "./ShareMenu.js";
import MakeCopyModal from "./MakeCopyModal.js";
import ShareConfirmationModal from "./ShareConfirmationModal.js";
import "../css/design.css";
import { useEffect } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase.js";

function DesignHead({
  designName,
  setDesignName,
  toggleComments,
  designId,
  setPromptBarOpen,
  designData,
  newName,
  setNewName,
  isEditingName,
  setIsEditingName,
  handleNameChange,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isChangeModeMenuOpen, setIsChangeModeMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareConfirmationModalOpen, setIsShareConfirmationModalOpen] =
    useState(false);
  const [isCopyLinkModalOpen, setIsCopyLinkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isMakeCopyModalOpen, setIsMakeCopyModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [isSecondPage, setIsSecondPage] = useState(false);
  const [role, setRole] = useState("Editor");
  const [notifyPeople, setNotifyPeople] = useState(true);
  const [tempName, setTempName] = useState(designName);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleEditNameToggle = () => {
    setIsEditingName((prev) => !prev);
  };

  const [originalName, setOriginalName] = useState("Untitled");

  useEffect(() => {
    const fetchDesignTitle = () => {
      const designRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "designs",
        designId
      );

      const unsubscribe = onSnapshot(designRef, (doc) => {
        if (doc.exists()) {
          const designData = doc.data();
          setTempName(designData.name || "Untitled");
          setOriginalName(designData.name || "Untitled");
        }
      });

      return () => unsubscribe();
    };

    if (designId) {
      fetchDesignTitle();
    }
  }, [designId]);

  const handleInputChange = (e) => {
    setTempName(e.target.value);
    setShowConfirm(true); // Show confirm/cancel buttons when the title is changed
  };

  const handleConfirm = async () => {
    try {
      const designRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "designs",
        designId
      );
      await updateDoc(designRef, {
        name: tempName,
      });
      setOriginalName(tempName); // Update the local state with the confirmed name
      setShowConfirm(false); // Hide confirm/cancel buttons
    } catch (error) {
      console.error("Error updating design name: ", error);
    }
  };

  const handleCancel = () => {
    setTempName(originalName); // Reset the input to the original title
    setShowConfirm(false); // Hide confirm/cancel buttons
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsShareMenuOpen(false);
    setIsChangeModeMenuOpen(false);
  };

  const handleShareClick = () => {
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
    setIsSecondPage(false);
  };

  const handleAddCollaborator = () => {
    if (newCollaborator.trim() !== "") {
      setCollaborators([...collaborators, newCollaborator]);
      setNewCollaborator("");
    }
  };

  const handleNext = () => {
    setIsSecondPage(true);
  };

  const handleShareProject = () => {
    if (collaborators.length > 0) {
      setIsShareModalOpen(false);
      setIsShareConfirmationModalOpen(true);
    }
  };

  const handleCloseShareConfirmationModal = () => {
    setIsShareConfirmationModalOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://example.com/your-project-link").then(
      () => {
        setIsCopyLinkModalOpen(true);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const handleCloseCopyLinkModal = () => {
    setIsCopyLinkModalOpen(false);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = () => {
    console.log("Item deleted");
    handleCloseDeleteModal();
  };

  const handleOpenDownloadModal = () => {
    setIsDownloadModalOpen(true);
  };

  const handleCloseDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  const handleOpenRenameModal = () => {
    setIsRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    setIsRenameModalOpen(false);
  };

  const handleOpenRestoreModal = () => {
    setIsRestoreModalOpen(true);
  };

  const handleCloseRestoreModal = () => {
    setIsRestoreModalOpen(false);
  };

  const handleOpenMakeCopyModal = () => {
    setIsMakeCopyModalOpen(true);
  };

  const handleCloseMakeCopyModal = () => {
    setIsMakeCopyModalOpen(false);
  };

  const handleOpenInfoModal = () => {
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };
  const handleInputClick = () => {
    // Enable edit mode when the input is clicked
    handleEditNameToggle();
  };

  const handleBlur = () => {
    // Save the name when the user clicks away from the input field
    if (isEditingName) {
      handleNameChange();
    }
  };

  return (
    <div className="designHead stickyMenu">
      <div className="left">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={setPromptBarOpen}
          sx={{ backgroundColor: "transparent", marginTop: "6px" }}
        >
          <MenuIcon sx={{ color: "white" }} />
        </IconButton>
        <div className="design-name-section">
          {isEditingName ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleBlur} // Save when the input loses focus
              autoFocus // Automatically focus on the input when in edit mode
              className="headTitleInput"
            />
          ) : (
            <span
              onClick={handleInputClick}
              className="headTitleInput"
              style={{ height: "20px" }}
            >
              {designData.name || "Untitled"}
            </span>
          )}
        </div>
      </div>
      <div className="right">
        <IconButton onClick={toggleComments}>
          <CommentIcon sx={{ color: "whitesmoke" }} />
        </IconButton>
        <IconButton>
          <ShareIcon
            sx={{ color: "whitesmoke" }}
            onClick={handleOpenShareModal}
          />
        </IconButton>
        <IconButton onClick={handleClick}>
          <MoreVertIcon sx={{ color: "whitesmoke" }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              backgroundColor: "#27262C",
              color: "white",
              minWidth: "200px",
            },
          }}
        >
          {isShareMenuOpen ? (
            <ShareMenu
              onClose={handleClose}
              onBackToMenu={handleBackToMenu}
              onOpenShareModal={handleOpenShareModal}
            />
          ) : isChangeModeMenuOpen ? (
            <ChangeModeMenu
              onClose={handleClose}
              onBackToMenu={handleBackToMenu}
            />
          ) : (
            <DefaultMenu
              onClose={handleClose}
              onCopyLink={handleCopyLink}
              onOpenDownloadModal={handleOpenDownloadModal}
              onOpenRenameModal={handleOpenRenameModal}
              onOpenRestoreModal={handleOpenRestoreModal}
              onOpenMakeCopyModal={handleOpenMakeCopyModal}
              onOpenInfoModal={handleOpenInfoModal}
              onOpenShareModal={handleShareClick}
              onDelete={handleOpenDeleteModal}
              onChangeMode={handleChangeModeClick}
            />
          )}
        </Menu>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        onAddCollaborator={handleAddCollaborator}
        onNext={handleNext}
        onShareProject={handleShareProject}
        collaborators={collaborators}
        newCollaborator={newCollaborator}
        isSecondPage={isSecondPage}
        role={role}
        notifyPeople={notifyPeople}
      />
      <ShareConfirmationModal
        isOpen={isShareConfirmationModalOpen}
        onClose={handleCloseShareConfirmationModal}
        collaborators={collaborators}
      />

      <CopyLinkModal
        isOpen={isCopyLinkModalOpen}
        onClose={handleCloseCopyLinkModal}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={handleCloseDownloadModal}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={handleCloseRenameModal}
      />

      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={handleCloseRestoreModal}
      />

      <MakeCopyModal
        isOpen={isMakeCopyModalOpen}
        onClose={handleCloseMakeCopyModal}
      />

      <InfoModal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} />
    </div>
  );
}

export default DesignHead;
