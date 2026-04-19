import bgImage from "../assets/images/auth-bg.png";



export default function AuthShell({ children }) {
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay pour lisibilité (banque privée / luxe) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Glows subtils */}
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-20 bg-[#1EC7A6]" />
      <div className="absolute top-0 -right-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-20 bg-[#7C3AED]" />

      <div className="relative z-10 min-h-screen grid place-items-center p-6">
        {children}
      </div>
    </div>
  );
}
