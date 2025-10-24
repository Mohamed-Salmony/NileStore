import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  animated?: boolean;
}

const Logo = ({ className = '', animated = true }: LogoProps) => {
  const logoSrc = '/NileStore-Logo.jpg';
  if (!animated) {
    return (
      <img
        src={logoSrc}
        alt="Nile Store Logo"
        className={`h-12 w-12 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <motion.img
      src={logoSrc}
      alt="Nile Store Logo"
      className={`h-12 w-12 rounded-full object-cover ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
      transition={{ duration: 0.5 }}
    />
  );
};

export default Logo;
