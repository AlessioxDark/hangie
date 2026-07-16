import React from "react";

const DoubleTick = ({ className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          d="M4 12.9L7.14286 16.5L15 7.5"
          stroke={"currentColor"}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>{" "}
        <path
          d="M20 7.5625L11.4283 16.5625L11 16"
          stroke={"currentColor"}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>{" "}
      </g>
    </svg>
  );
};

export default DoubleTick;
