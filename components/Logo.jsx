import Image from "next/image";

export default function Logo({ size = 200 }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <Image
        src="/Logo.png"
        alt="Logo"
        fill
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
