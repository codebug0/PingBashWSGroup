import React, { useEffect } from "react";

const ChatangoWidget: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "cid0020000414253877163";
    script.dataset.cfasync = "false";
    script.async = true;
    script.src = "//st.chatango.com/js/gz/emb.js";

    // Set style attributes manually
    script.setAttribute("style", "width: 773px; height: 562px;");

    // Set the Chatango config as innerHTML (must be a string)
    script.innerHTML = JSON.stringify({
      handle: "123345qqqeeee",
      arch: "js",
      styles: {
        a: "CC0000",
        b: 100,
        c: "FFFFFF",
        d: "FFFFFF",
        k: "CC0000",
        l: "CC0000",
        m: "CC0000",
        n: "FFFFFF",
        p: "10",
        q: "CC0000",
        r: 100,
        fwtickm: 1,
      },
    });

    document.getElementById("chatango-container")?.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.getElementById("chatango-container")?.removeChild(script);
    };
  }, []);

  return <div id="chatango-container" />;
};

export default ChatangoWidget;