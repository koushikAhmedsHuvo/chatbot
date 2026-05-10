import { BiLoaderCircle } from "react-icons/bi";
import { useThemeStore } from "../store/useThemeStore";

export default function PageLoader() {
  const {theme}=useThemeStore();
  return (
    <div className='min-h-screen flex items-center justify-center' data-theme={theme}>
      <BiLoaderCircle className="animate-spin text-4xl text-primary" />
    </div>
  )
}
