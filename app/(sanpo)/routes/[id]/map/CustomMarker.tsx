import { OverlayView } from "@react-google-maps/api";

export default function CustomMarker({name,coordinate}) {
  return(
<OverlayView
        position={coordinate}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* ラベル */}
          <div
            style={{
              color: "#ffffff",
              background: "#000000",
              fontSize: "12px",
              textAlign: "center",
              padding: "5px 10px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              transform: "translateY(-30px)", // ピンからの高さ調整
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            {name}
          </div>

          {/* ピン */}
          <div
            style={{
              width: "15px",
              height: "15px",
              backgroundColor: "green",
              borderRadius: "50%",
              border: "2px solid white",
              boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)",
              position: "relative",
              zIndex: 10,
            }}
          />
          {/* ピンの下の三角形 */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "10px solid green",
              marginTop: "-2px",
            }}
          />
        </div>
      </OverlayView>
  )
}