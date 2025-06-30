type HeroClassIconProps = {
  className: string;
  width_size?: number | string;
};

export default function HeroClassIcon({ className, width_size = 48 }: HeroClassIconProps) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let src = "";
  let alt = "";

  switch (className) {
    case "Warrior":
      src = `${base}/assets/character_warrior_sword.png`;
      alt = "Warrior";
      break;
    case "Guardian":
      src = `${base}/assets/character_guardian.png`;
      alt = "Guardian";
      break;
    case "Mage":
      src = `${base}/assets/character_mage.png`;
      alt = "Mage";
      break;
    default:
      return null;
  }

  return <img src={src} alt={alt} style={{ width: width_size, height: "100%", margin: "0 auto" }} />;
}
