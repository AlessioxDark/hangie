import React from "react";
import DefaultGroupIcon from "@/assets/icons/DefaultGroupIcon";

const GroupIcon = ({ group_cover_img, className = "w-6 h-6" }) => {
  if (group_cover_img == null) {
    return (
      <div className={className}>
        <DefaultGroupIcon />
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        className="rounded-full w-full h-full aspect-square object-cover"
        src={group_cover_img}
        alt="Group cover"
        loading="lazy"
      />
    </div>
  );
};

export default GroupIcon;
