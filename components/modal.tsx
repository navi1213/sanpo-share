import Image from "next/image";

export default function Modal({ path, text, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        color: "#fff",
      }}
    >
      <div style={{ position: "relative", width: "600px", height: "600px" }}>
        {/* 画像 */}
        <Image
          src={path}
          alt="悲しいワンちゃん"
          layout="fill"
          objectFit="cover" // 画像を全体にフィット
          style={{ borderRadius: "10px" }}
        />
        {/* 文字 */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明の背景
            padding: "10px 20px",
            borderRadius: "5px",
          }}
        >
          {text}
        </div>
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ✖
        </button>
      </div>
    </div>
  );
}
