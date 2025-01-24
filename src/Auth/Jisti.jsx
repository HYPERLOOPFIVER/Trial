import React, { useEffect } from "react";

// JitsiMeet component
const JitsiMeet = ({ roomName, userInfo, jwt }) => {
  useEffect(() => {
    // Set up the domain and options for the Jitsi API
    const domain = "meet.jit.si";
    const options = {
      roomName: roomName, // Unique room name
      parentNode: document.getElementById("meet"), // Container for IFrame
      jwt: jwt, // JWT token for authentication
      userInfo: userInfo, // User info (name, email)
      width: "100%", // Responsive width
      height: "700px", // Fixed height for the IFrame
      configOverwrite: {
        startWithAudioMuted: true, // Mute audio on join
        startWithVideoMuted: false, // Start with video unmuted
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "hangup", "chat", "tileview",
        ], // Toolbar buttons
        TILE_VIEW_MAX_COLUMNS: 3, // Max columns in tile view
      },
    };

    // Initialize the Jitsi Meet External API
    const api = new window.JitsiMeetExternalAPI(domain, options);

    // Optional: Handle meeting events like video conference joined and left
    api.addEventListener("videoConferenceJoined", () => {
      console.log("Meeting joined!");
    });

    api.addEventListener("videoConferenceLeft", () => {
      console.log("Meeting left!");
    });

    // Clean up Jitsi API instance when component unmounts
    return () => {
      api.dispose();
    };
  }, [roomName, userInfo, jwt]); // Re-run effect when props change

  return <div id="meet" style={{ height: "700px", width: "100%" }} />;
};

export default JitsiMeet;
