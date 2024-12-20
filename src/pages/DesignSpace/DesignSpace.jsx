import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DesignHead from "../../components/DesignHead";
import BottomBar from "./BottomBar";
import { useSharedProps } from "../../contexts/SharedPropsContext";

function DesignSpace({
  design,
  isDesign,
  designId,
  setShowComments = () => {},
  isSelectingMask = false,
  changeMode,
  setChangeMode,
  children,
}) {
  const { user, userDoc } = useSharedProps();
  const location = useLocation();
  const [showBudget, setShowBudget] = useState(false);

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

    if (design?.history?.length > 0) {
      setShowBudget(true);
    }

    // Set role and all dependent flags
    if (!location.state?.changeMode) {
      const defaultMode =
        newRole === 1 || newRole === 3 ? "Editing" : newRole === 2 ? "Commenting" : "Viewing";
      setChangeMode(defaultMode);
    }
  }, [design, user, userDoc, location?.state?.changeMode]);

  return (
    <div className="design-space">
      <DesignHead
        design={design}
        changeMode={changeMode}
        setChangeMode={setChangeMode}
        setShowComments={setShowComments}
        isSelectingMask={isSelectingMask}
      />
      {children}
      <BottomBar
        isDesign={isDesign}
        designId={designId}
        changeMode={changeMode}
        showBudget={showBudget}
      />
    </div>
  );
}

export default DesignSpace;
