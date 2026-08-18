import './styles/style.css'
import Experience from './experience/Experience.js'
import { initBarba } from './barba.js'
import { initLenis } from './lenis.js'
import { initButtons } from './button.js'

const experience = new Experience(document.querySelector('.webgl'))
initLenis()
initButtons()
initBarba(experience)
