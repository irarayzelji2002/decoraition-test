import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Assuming you have firebase setup
import DesignHead from "../../components/DesignHead";
import { getAuth } from "firebase/auth";
import PromptBar from "./PromptBar";
import BottomBar from "../../components/BottomBar";
import Loading from "../../components/Loading";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "../../css/design.css";
import DrawerComponent from "../Homepage/DrawerComponent";

import Budget from "./Budget";

function Design() {
  const { designId } = useParams(); // Get designId from the URL
  const [designData, setDesignData] = useState(null);
  const [newName, setNewName] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [showPromptBar, setShowPromptBar] = useState(true);
  const [numImageFrames, setNumImageFrames] = useState(2);
  const [isEditingName, setIsEditingName] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("design");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Fetch design details based on designId
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);

        const fetchDesignDetails = async () => {
          try {
            const designRef = doc(db, "users", user.uid, "designs", designId);
            const designSnapshot = await getDoc(designRef);
            if (designSnapshot.exists()) {
              const design = designSnapshot.data();
              setDesignData(design);
              setNewName(design.name);
            } else {
              console.error("Design not found");
            }
          } catch (error) {
            console.error("Error fetching design details:", error);
          }
        };

        fetchDesignDetails();
      } else {
        console.error("User is not authenticated");
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [designId]);

  const handleEditNameToggle = () => {
    setIsEditingName((prev) => !prev);
  };

  const handleNameChange = async () => {
    if (newName.trim() === "") {
      alert("Design name cannot be empty");
      return;
    }

    try {
      const designRef = doc(db, "users", userId, "designs", designId);
      await updateDoc(designRef, { name: newName });
      setIsEditingName(false);
      toast.success("Design name updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          color: "var(--color-white)",
          backgroundColor: "var(--inputBg)",
        },
        progressStyle: {
          backgroundColor: "var(--brightFont)",
        },
      });

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error updating design name:", error);
      alert("Failed to update design name");
    }
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const togglePromptBar = () => {
    setShowPromptBar((prev) => !prev);
  };

  if (!designData) {
    return (
      <>
        <Loading />
      </>
    );
  }
  return (
    <div className="whole">
      <ToastContainer
        progressStyle={{ backgroundColor: "var(--brightFont)" }}
      />
      <DesignHead
        designData={designData}
        newName={newName}
        setNewName={setNewName}
        isEditingName={isEditingName}
        toggleComments={toggleComments}
        handleNameChange={handleNameChange}
        setIsEditingName={setIsEditingName}
        handleEditNameToggle={handleEditNameToggle}
        setPromptBarOpen={togglePromptBar}
      />
      {activeTab === "design" && (
        <>
          {" "}
          <div className="create-design">
            <div className="workspace">
              {showPromptBar && <DrawerComponent />}
              <PromptBar />
              <div className="working-area">
                {/* <div className="design-name-section">
              <h2>Design Name:</h2>
              {isEditingName ? (
                <div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <button onClick={handleNameChange}>Save</button>
                  <button onClick={handleEditNameToggle}>Cancel</button>
                </div>
              ) : (
                <div>
                  <p>{designData.name}</p>
                  <button onClick={handleEditNameToggle}>Edit Name</button>
                </div>
              )}
            </div> */}

                <div className="frame-buttons">
                  <button onClick={() => setNumImageFrames(2)}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 451 451"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.9687 21.9688C7.9024 36.0351 0 55.1132 0 75.006V131.26C0 151.153 7.9024 170.231 21.9687 184.298C36.0351 198.364 55.1132 206.267 75.006 206.267H131.261C133.209 206.267 135.151 206.191 137.08 206.041H312.956C314.885 206.191 316.826 206.267 318.775 206.267H375.03C394.923 206.267 414.001 198.364 428.067 184.298C442.134 170.231 450.036 151.153 450.036 131.26V75.006C450.036 55.1132 442.134 36.0351 428.067 21.9688C414.001 7.9024 394.923 0 375.03 0H75.006C55.1132 0 36.0351 7.9024 21.9687 21.9688Z"
                        fill="var(--color-white)"
                      />
                      <path
                        d="M21.9687 265.738C7.9024 279.805 0 298.883 0 318.775V375.03C0 394.923 7.9024 414.001 21.9687 428.067C36.0351 442.134 55.1132 450.036 75.006 450.036H375.03C394.923 450.036 414.001 442.134 428.067 428.067C442.134 414.001 450.036 394.923 450.036 375.03V318.775C450.036 298.883 442.134 279.805 428.067 265.738C414.001 251.672 394.923 243.769 375.03 243.769H318.775C316.826 243.769 314.885 243.845 312.956 243.995H137.08C135.151 243.845 133.209 243.769 131.261 243.769H75.006C55.1132 243.769 36.0351 251.672 21.9687 265.738Z"
                        fill="var(--color-white)"
                      />
                    </svg>
                  </button>
                  <button onClick={() => setNumImageFrames(4)}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 449 451"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 75.0316C0 55.132 7.88069 36.0474 21.9084 21.9762C35.9361 7.90509 54.9618 0 74.8 0H130.9C150.738 0 169.764 7.90509 183.792 21.9762C197.819 36.0474 205.7 55.132 205.7 75.0316V131.305C205.7 151.205 197.819 170.289 183.792 184.361C169.764 198.432 150.738 206.337 130.9 206.337H74.8C54.9618 206.337 35.9361 198.432 21.9084 184.361C7.88069 170.289 0 151.205 0 131.305V75.0316ZM243.1 75.0316C243.1 55.132 250.981 36.0474 265.008 21.9762C279.036 7.90509 298.062 0 317.9 0H374C393.838 0 412.864 7.90509 426.892 21.9762C440.919 36.0474 448.8 55.132 448.8 75.0316V131.305C448.8 151.205 440.919 170.289 426.892 184.361C412.864 198.432 393.838 206.337 374 206.337H317.9C298.062 206.337 279.036 198.432 265.008 184.361C250.981 170.289 243.1 151.205 243.1 131.305V75.0316ZM0 318.884C0 298.985 7.88069 279.9 21.9084 265.829C35.9361 251.758 54.9618 243.853 74.8 243.853H130.9C150.738 243.853 169.764 251.758 183.792 265.829C197.819 279.9 205.7 298.985 205.7 318.884V375.158C205.7 395.058 197.819 414.142 183.792 428.213C169.764 442.284 150.738 450.189 130.9 450.189H74.8C54.9618 450.189 35.9361 442.284 21.9084 428.213C7.88069 414.142 0 395.058 0 375.158V318.884ZM243.1 318.884C243.1 298.985 250.981 279.9 265.008 265.829C279.036 251.758 298.062 243.853 317.9 243.853H374C393.838 243.853 412.864 251.758 426.892 265.829C440.919 279.9 448.8 298.985 448.8 318.884V375.158C448.8 395.058 440.919 414.142 426.892 428.213C412.864 442.284 393.838 450.189 374 450.189H317.9C298.062 450.189 279.036 442.284 265.008 428.213C250.981 414.142 243.1 395.058 243.1 375.158V318.884Z"
                        fill="var(--color-white)"
                      />
                    </svg>
                  </button>
                </div>
                {Array.from({ length: numImageFrames }).map((_, index) => (
                  <div className="image-frame" key={index}>
                    <img
                      src="../../img/logoWhitebg.png"
                      alt={`design preview ${index + 1}`}
                      className="image-preview"
                    />
                  </div>
                ))}
              </div>
              {showComments && (
                <div className="comment-section">
                  <h4>Comments</h4>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comment here..."
                  />
                  <button className="add-comment-button">Add a comment</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {activeTab === "budget" && (
        <>
          <Budget />
        </>
      )}

      <BottomBar onTabChange={handleTabChange} />
    </div>
  );
}

export default Design;
