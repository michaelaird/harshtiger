// src/index.ts

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.use(require('vue-moment'));

import RootComponent from "./components/root.vue";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

let v = new Vue({
    el: "#app",
    template: `
    <div>
    <root-component   />
</div>
`,
    data: { guardian: "nukedog416" },
    components: {
        RootComponent
    }
});