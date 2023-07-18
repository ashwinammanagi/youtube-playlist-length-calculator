import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import InlineMessage from 'primevue/inlinemessage';
import ScrollTop from 'primevue/scrolltop';
import Slider from 'primevue/slider';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';


// theme
import 'primevue/resources/themes/vela-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue);
app.component('InputText', InputText);
app.component('Button', Button);
app.component('InlineMessage', InlineMessage);
app.component('ScrollTop', ScrollTop);
app.component('Slider', Slider);
app.component('Card', Card);
app.component('Divider', Divider);
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.mount('#app')