import Hero from '../components/Hero';
import LibrosDelMes from '../components/LibrosDelMes';
import Separador from '../components/Separador';
import MenuInicio from '../components/MenuInicio';
import EventosInicio from '../components/EventosInicio';
import SobreNosotros from '../components/SobreNosotros';
import Contacto from '../components/Contacto';

function Inicio() {
  return (
    <>
      <Hero />
      <LibrosDelMes />
      <Separador />
      <MenuInicio />
      <div className="divisor-cuadros" aria-hidden="true"></div>
      <EventosInicio />
      <SobreNosotros />
      <Contacto />
    </>
  );
}

export default Inicio;