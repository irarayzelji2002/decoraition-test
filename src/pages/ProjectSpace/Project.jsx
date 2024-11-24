import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onSnapshot, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Paper,
  IconButton,
  InputBase,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  CloseRounded as CloseRoundedIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { AddIcon } from "../../components/svg/DefaultMenuIcons";
import { showToast } from "../../functions/utils";
import { auth, db } from "../../firebase";
import ProjectHead from "./ProjectHead";
import Modal from "../../components/Modal";
import BottomBarDesign from "./BottomBarProject";
import Loading from "../../components/Loading";
import DesignIcon from "../../components/DesignIcon";
import Dropdowns from "../../components/Dropdowns";
import "../../css/seeAll.css";
import "../../css/project.css";
import {
  handleCreateDesignWithLoading,
  fetchUserDesigns,
  updateDesignProjectId,
} from "./backend/ProjectDetails";
import { AddDesign, AddProject } from "../DesignSpace/svg/AddImage";
import { HorizontalIcon, TiledIcon, VerticalIcon } from "./svg/ExportIcon";
import { Typography } from "@mui/material";
import { ListIcon } from "./svg/ExportIcon";
import { useSharedProps } from "../../contexts/SharedPropsContext";
import LoadingPage from "../../components/LoadingPage";
import { iconButtonStyles } from "../Homepage/DrawerComponent";
import { formatDateLong, getUsername } from "../Homepage/backend/HomepageActions";
import HomepageTable from "../Homepage/HomepageTable";

function Project() {
  const { isDarkMode } = useSharedProps();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const { projectId } = useParams();
  const [newName, setNewName] = useState("");
  const [userId, setUserId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, userDesigns } = useSharedProps();
  const [isVertical, setIsVertical] = useState(false);
  const navigate = useNavigate();
  const [optionsState, setOptionsState] = useState({
    showOptions: false,
    selectedId: null,
  });
  const [filteredDesignsForTable, setFilteredDesignsForTable] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [sortBy, setSortBy] = useState("none");
  const [order, setOrder] = useState("none");
  const [isDesignButtonDisabled, setIsDesignButtonDisabled] = useState(false);
  const [numToShowMoreDesign, setNumToShowMoreDesign] = useState(0);
  const [thresholdDesign, setThresholdDesign] = useState(6);
  const [loadingImage, setLoadingImage] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const userDesignsWithoutProject = userDesigns.filter((design) => !design.projectId);

  const handleVerticalClick = () => {
    setIsVertical(true);
  };
  const handleHorizontalClick = () => {
    setIsVertical(false);
  };
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const applyFilters = async (sortBy, order) => {
    let sortedDesigns = [...designs];

    if (sortBy && sortBy !== "none" && order && order !== "none") {
      sortedDesigns = sortedDesigns.sort((a, b) => {
        let comparison = 0;
        if (sortBy === "name") {
          comparison = a.designName.localeCompare(b.designName);
        } else if (sortBy === "created") {
          comparison = a.createdAt.toMillis() - b.createdAt.toMillis();
        } else if (sortBy === "modified") {
          comparison = a.modifiedAt.toMillis() - b.modifiedAt.toMillis();
        }
        return order === "ascending" ? comparison : -comparison;
      });
    }

    const tableData = await Promise.all(
      sortedDesigns.map(async (design) => ({
        ...design,
        owner: await getUsername(design.owner),
        formattedCreatedAt: formatDateLong(design.createdAt),
        formattedModifiedAt: formatDateLong(design.modifiedAt),
      }))
    );

    setFilteredDesignsForTable(tableData);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          console.log(`Fetching designs for projectId: ${projectId}`); // Debug log
          const projectDesigns = userDesigns
            .filter((design) => design.projectId === projectId)
            .sort((a, b) => b.modifiedAt.toMillis() - a.modifiedAt.toMillis());
          setDesigns(projectDesigns);
          setLoadingImage(false); // Set loading to false after fetching
        } catch (error) {
          showToast("error", `Error fetching project designs: ${error.message}`);
          setLoadingDesigns(false); // Set loading to false on error
          setLoadingImage(false); // Set loading to false on error
        }
      }
    };

    fetchData();
  }, [user, projectId, userDesigns]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);

        const fetchProjectDetails = async () => {
          try {
            const projectRef = doc(db, "projects", projectId);
            const projectSnapshot = await getDoc(projectRef);
            if (projectSnapshot.exists()) {
              const project = projectSnapshot.data();
              setProjectData(project);
              setNewName(project.name);

              // Listen for real-time updates to the project document
              const unsubscribeProject = onSnapshot(projectRef, (doc) => {
                if (doc.exists()) {
                  const updatedProject = doc.data();
                  setProjectData(updatedProject);
                  setNewName(updatedProject.name);
                }
              });

              // Cleanup listener on component unmount
              return () => unsubscribeProject();
            } else {
              console.error("Project not found");
            }
          } catch (error) {
            console.error("Error fetching project details:", error);
          }
        };

        fetchProjectDetails();
      } else {
        console.error("User is not authenticated");
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [projectId]);

  useEffect(() => {
    applyFilters(sortBy, order);
  }, [designs, sortBy, order]);

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  if (loadingImage) {
    return <LoadingPage />;
  }

  if (!projectData) {
    return <LoadingPage />;
  }

  const handleCreateDesign = async () => {
    setIsDesignButtonDisabled(true);
    await handleCreateDesignWithLoading(projectId, setDesigns);
    setIsDesignButtonDisabled(false);
  };

  const handleImportDesign = () => {
    setImportModalOpen(true);
  };

  const handleConfirmImport = async () => {
    if (selectedDesignId) {
      await updateDesignProjectId(selectedDesignId, projectId);
      setImportModalOpen(false);
      setSelectedDesignId("");
      const updatedDesigns = userDesigns.filter((design) => design.projectId === projectId);
      setDesigns(updatedDesigns);
    }
  };

  return (
    <>
      <ProjectHead project={projectData} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {menuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "90%",
            marginTop: "40px",
            backgroundColor: "var(--bgMain)",
            border: "2px solid var(--borderInput)",
            borderRadius: "20px",
            "&:focus-within": {
              borderColor: "var(--brightFont)",
            },
          }}
        >
          <IconButton
            type="button"
            sx={{ p: "10px", color: "var(--color-white)" }}
            aria-label="search"
          >
            <SearchIcon sx={{ color: "var(--color-white)" }} />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, color: "var(--color-white)" }}
            placeholder="Search designs on this project"
            inputProps={{ "aria-label": "search google maps" }}
          />
        </Paper>
        {!isVertical && (
          <div className="dropdown-container">
            <Dropdowns
              sortBy={sortBy}
              order={order}
              isDesign={true}
              onSortByChange={setSortBy}
              onOrderChange={setOrder}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <main
            className="content"
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              overflow: "hidden",
            }}
          ></main>
        </div>
      </div>
      <div
        style={{
          paddingBottom: "20%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "90%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ width: "90%" }}>
            <div style={{ display: "flex" }}>
              <span
                className="SubtitlePrice"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                Designs
              </span>
              <div className="button-container" style={{ display: "flex", marginLeft: "auto" }}>
                <IconButton
                  style={{ marginRight: "10px" }}
                  onClick={handleHorizontalClick}
                  sx={{
                    ...iconButtonStyles,
                    padding: "10px",
                    marginRight: "10px",
                    borderRadius: "8px",
                    backgroundColor: !isVertical ? "var(--nav-card-modal)" : "transparent",
                  }}
                >
                  <TiledIcon />
                </IconButton>
                <IconButton
                  sx={{
                    ...iconButtonStyles,
                    padding: "10px",
                    marginRight: "10px",
                    borderRadius: "8px",
                    backgroundColor: isVertical ? "var(--nav-card-modal)" : "transparent",
                  }}
                  onClick={handleVerticalClick}
                >
                  <ListIcon />
                </IconButton>
              </div>
            </div>
          </div>

          <div
            className={`layout ${isVertical ? "vertical" : ""}`}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {isVertical ? (
              <HomepageTable
                isDesign={true}
                data={filteredDesignsForTable}
                isHomepage={false}
                numToShowMore={numToShowMoreDesign}
                optionsState={optionsState}
                setOptionsState={setOptionsState}
              />
            ) : (
              <>
                {filteredDesignsForTable.slice(0, 6 + numToShowMoreDesign).map((design) => (
                  <DesignIcon
                    key={design.id}
                    id={design.id}
                    name={design.designName}
                    design={design}
                    onOpen={() =>
                      navigate(`/design/${design.id}`, {
                        state: { designId: design.id },
                      })
                    }
                    owner={getUsername(design.owner)}
                    createdAt={formatDateLong(design.createdAt)}
                    modifiedAt={formatDateLong(design.modifiedAt)}
                    optionsState={optionsState}
                    setOptionsState={setOptionsState}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        <div
          className="center-me"
          style={{ display: "inline-flex", marginTop: "20px", position: "relative" }}
        >
          {designs.length > thresholdDesign && numToShowMoreDesign < designs.length && (
            <Button
              variant="contained"
              onClick={() => setNumToShowMoreDesign(numToShowMoreDesign + thresholdDesign)}
              className="cancel-button"
              sx={{
                width: "200px",
              }}
            >
              Show more
            </Button>
          )}
        </div>
        {filteredDesignsForTable.length === 0 && (
          <div className="no-content">
            <img
              src={`/img/design-placeholder${!isDarkMode ? "-dark" : ""}.png`}
              alt="No designs yet"
            />
            <p>No designs yet. Start creating.</p>
          </div>
        )}
      </div>

      <div className="circle-button-container">
        {menuOpen && (
          <div className="small-buttons">
            <div
              className="small-button-container"
              onClick={handleImportDesign}
              style={{
                opacity: isDesignButtonDisabled ? "0.5" : "1",
                cursor: isDesignButtonDisabled ? "default" : "pointer",
              }}
            >
              <span className="small-button-text">Import a Design</span>
              <div className="small-circle-button">
                <AddDesign />
              </div>
            </div>
            <div
              className="small-button-container"
              onClick={() => !isDesignButtonDisabled && handleCreateDesign()}
              style={{
                opacity: isDesignButtonDisabled ? "0.5" : "1",
                cursor: isDesignButtonDisabled ? "default" : "pointer",
              }}
            >
              <span className="small-button-text">Create a Design</span>
              <div className="small-circle-button">
                <AddProject />
              </div>
            </div>
          </div>
        )}
        <div className={`circle-button ${menuOpen ? "rotate" : ""} add`} onClick={toggleMenu}>
          {menuOpen ? <AddIcon /> : <AddIcon />}
        </div>
      </div>

      {importModalOpen && (
        <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)}>
          <div className="modalContent" style={{ padding: "20px", textAlign: "center" }}>
            <h2>Import a Design</h2>
            <FormControl fullWidth style={{ marginBottom: "20px" }}>
              <InputLabel id="select-design-label">Select Design</InputLabel>
              <Select
                labelId="select-design-label"
                value={selectedDesignId}
                onChange={(e) => setSelectedDesignId(e.target.value)}
              >
                {userDesignsWithoutProject.map((design) => (
                  <MenuItem key={design.id} value={design.id}>
                    {design.designName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmImport}
              disabled={!selectedDesignId}
              style={{ marginRight: "10px" }}
            >
              Confirm
            </Button>
            <Button variant="outlined" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {modalOpen && <Modal onClose={closeModal} />}

      <BottomBarDesign Design={true} projId={projectId} />
    </>
  );
}

export default Project;
