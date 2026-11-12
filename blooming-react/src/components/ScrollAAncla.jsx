import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollAAncla() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const temporizador = setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      return () => clearTimeout(temporizador);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

export default ScrollAAncla;